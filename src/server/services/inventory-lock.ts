import { db } from '@/lib/db';
import { inventoryLevels } from '@/lib/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';

export async function reserveInventoryForCheckout(
  items: { variantId: string; quantity: number }[]
): Promise<void> {
  await db.transaction(async (tx) => {
    for (const item of items) {
      const [updated] = await tx
        .update(inventoryLevels)
        .set({
          availableStock: sql`${inventoryLevels.availableStock} - ${item.quantity}`,
          reservedStock: sql`${inventoryLevels.reservedStock} + ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(inventoryLevels.variantId, item.variantId),
            gte(inventoryLevels.availableStock, item.quantity)
          )
        )
        .returning({ variantId: inventoryLevels.variantId });

      if (!updated) {
        throw new Error(`ERR_INSUFFICIENT_STOCK:${item.variantId}`);
      }
    }
  });
}

export async function deductWuyePosFloorStock(
  items: { variantId: string; quantity: number }[]
): Promise<void> {
  await db.transaction(async (tx) => {
    for (const item of items) {
      const [updated] = await tx
        .update(inventoryLevels)
        .set({
          availableStock: sql`${inventoryLevels.availableStock} - ${item.quantity}`,
          wuyeFloorStock: sql`GREATEST(0, ${inventoryLevels.wuyeFloorStock} - ${item.quantity})`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(inventoryLevels.variantId, item.variantId),
            gte(inventoryLevels.availableStock, item.quantity)
          )
        )
        .returning({ variantId: inventoryLevels.variantId });

      if (!updated) {
        throw new Error(`ERR_INSUFFICIENT_STOCK:${item.variantId}`);
      }
    }
  });
}
