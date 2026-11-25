import { db } from '@/lib/db';
import {
  inventoryLevels,
  orderItems,
  orders,
  webhookEvents,
} from '@/lib/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';

export interface WebhookReconciliationInput {
  provider: 'PAYSTACK' | 'FLUTTERWAVE';
  providerEventId: string;
  eventType: string;
  reference: string;
  amountPaidKobo: number;
  rawPayload: unknown;
}

export interface WebhookReconciliationResult {
  alreadyProcessed: boolean;
  newStatus: string | null;
}

export async function processIdempotentPaymentWebhook(
  input: WebhookReconciliationInput
): Promise<WebhookReconciliationResult> {
  return await db.transaction(async (tx) => {
    const insertedEvents = await tx
      .insert(webhookEvents)
      .values({
        provider: input.provider,
        providerEventId: input.providerEventId,
        eventType: input.eventType,
        reference: input.reference,
        payload: input.rawPayload,
      })
      .onConflictDoNothing({ target: webhookEvents.providerEventId })
      .returning({ id: webhookEvents.id });

    if (insertedEvents.length === 0) {
      return { alreadyProcessed: true, newStatus: null };
    }

    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.paymentReference, input.reference))
      .for('update');

    if (!order) {
      return { alreadyProcessed: false, newStatus: null };
    }

    if (input.amountPaidKobo < order.totalAmountKobo) {
      await tx
        .update(orders)
        .set({ status: 'AMOUNT_MISMATCH_HOLD', updatedAt: new Date() })
        .where(eq(orders.id, order.id));
      return { alreadyProcessed: false, newStatus: 'AMOUNT_MISMATCH_HOLD' };
    }

    const items = await tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    if (order.status === 'PENDING_PAYMENT') {
      for (const item of items) {
        await tx
          .update(inventoryLevels)
          .set({
            reservedStock: sql`GREATEST(0, ${inventoryLevels.reservedStock} - ${item.quantity})`,
            updatedAt: new Date(),
          })
          .where(eq(inventoryLevels.variantId, item.variantId));
      }

      await tx
        .update(orders)
        .set({
          status: 'PAID',
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      return { alreadyProcessed: false, newStatus: 'PAID' };
    }

    if (order.status === 'CANCELLED') {
      let allRestockedAvailable = true;
      for (const item of items) {
        const [redecremented] = await tx
          .update(inventoryLevels)
          .set({
            availableStock: sql`${inventoryLevels.availableStock} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(inventoryLevels.variantId, item.variantId),
              gte(inventoryLevels.availableStock, item.quantity)
            )
          )
          .returning({ variantId: inventoryLevels.variantId });

        if (!redecremented) {
          allRestockedAvailable = false;
          break;
        }
      }

      const resolvedStatus = allRestockedAvailable
        ? 'PAID'
        : 'PAID_REQUIRES_ADMIN_RESOLUTION';

      await tx
        .update(orders)
        .set({
          status: resolvedStatus,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      return { alreadyProcessed: false, newStatus: resolvedStatus };
    }

    return { alreadyProcessed: false, newStatus: order.status };
  });
}
