import { NextResponse } from 'next/server';
import { env } from '@/env';
import { db } from '@/lib/db';
import { inventoryLevels, orderItems, orders } from '@/lib/db/schema';
import { and, eq, lt, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  let releasedOrdersCount = 0;

  await db.transaction(async (tx) => {
    const expiredOrders = await tx
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.status, 'PENDING_PAYMENT'),
          lt(orders.reservationExpiresAt, now)
        )
      )
      .for('update', { skipLocked: true });

    for (const order of expiredOrders) {
      const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      for (const item of items) {
        await tx
          .update(inventoryLevels)
          .set({
            availableStock: sql`${inventoryLevels.availableStock} + ${item.quantity}`,
            reservedStock: sql`GREATEST(0, ${inventoryLevels.reservedStock} - ${item.quantity})`,
            updatedAt: new Date(),
          })
          .where(eq(inventoryLevels.variantId, item.variantId));
      }

      await tx
        .update(orders)
        .set({ status: 'CANCELLED', updatedAt: new Date() })
        .where(eq(orders.id, order.id));

      releasedOrdersCount += 1;
    }
  });

  return NextResponse.json({
    ok: true,
    releasedOrdersCount,
    sweptAt: now.toISOString(),
  });
}
