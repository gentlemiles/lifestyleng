# State Sync, Omnichannel Inventory & Concurrency Specification
**Project:** LifestyleNG.com — Unified Multi-Service Platform  
**Parent Organization:** Lifestyle Corporate Networks Ltd.  
**Priority Level:** CRITICAL (Prevents Overselling Across Online & Physical Wuye Storefront)

## 1. Hybrid Cart Architecture (Fashion + MTN Telecom Hardware)
The shopping bag supports physical SKUs from both retail divisions:
- **Lifestyle Boutique (Fashion):** Clothing, Shoes, Bags, and Accessories (`/shop/clothes`).
- **Lifestyle MTN Services:** MTN 5G/4G Routers, Pocket MiFis, Outdoor CPE Antennas, and SIM Starter Packs (`/mtn-services/fibrex`).

### 1.1 Cookie + Database Persistence Mechanics
1. **Anonymous Session Tracking:** When an unauthenticated `GUEST` adds their first item to the bag, the Server Action generates a cryptographically random 32-byte token (`crypto.randomBytes(32).toString('hex')`), sets it in an HTTP-only, `SameSite=Lax`, `Secure` cookie named `lifestyleng_cart_token` (TTL: 30 days), and stores only its SHA-256 hash in `carts.guest_token_hash`.
2. **Optimistic Client UI:** The `SlideOverCart` component uses React 19 `useOptimistic` to reflect quantity increments/decrements and omnichannel fulfillment switches (`ABUJA_DOORSTEP_DELIVERY` vs. `WUYE_IN_STORE_PICKUP` at Suite 83 / Block B70, H&A Plaza, Wuye, Abuja) in `<16ms`, while `upsertCartItemAction` reconciles state against PostgreSQL and calls `revalidateTag('cart')`.

---

## 2. Deterministic Guest-to-Authenticated Cart Merge Algorithm
When a user with an active `lifestyleng_cart_token` cookie authenticates or registers:
1. Open a single PostgreSQL transaction (`db.transaction`).
2. Fetch the user's existing authenticated cart (`authCart`) and the anonymous cookie cart (`guestCart`).
3. For each item in `guestCart`:
   - Query `inventory_levels.available_stock` for `variant_id`.
   - Calculate `mergedQty = Math.min((authItem?.quantity ?? 0) + guestItem.quantity, availableStock)`.
   - Upsert `mergedQty` into `authCart` (if `mergedQty > 0`).
4. Delete `guestCart` and clear the `lifestyleng_cart_token` cookie.

---

## 3. Atomic Inventory Locking & Wuye Physical Boutique POS Sync
Because **Lifestyle Boutique (Fashion)** operates both online (`/shop/clothes`) and physically at **Suite 83 / Block B70, H&A Plaza, Wuye, Abuja**, naive `stock = stock - 1` application math is strictly forbidden.

### 3.1 Atomic Checkout Reservation (`initializeCheckoutAction`)
During checkout session creation, execute this exact atomic SQL transaction for all cart items:

```typescript
// src/server/services/inventory-lock.ts
import { db } from '@/lib/db';
import { inventoryLevels, orders, orderItems } from '@/lib/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

export async function reserveInventoryForCheckout(
  items: { variantId: string; quantity: number }[]
) {
  return await db.transaction(async (tx) => {
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
        // Immediate rollback of the entire transaction if any single SKU is short
        throw new Error(`ERR_INSUFFICIENT_STOCK:${item.variantId}`);
      }
    }
  });
}
```

### 3.2 Physical Store Walk-In Sale Deduction (`recordWuyePosSaleAction`)
When a customer buys an item in person at Suite 83 / Block B70, H&A Plaza, Wuye, the Admin logs a `POS_WALK_IN` order which executes the same conditional `available_stock >= quantity` atomic decrement and immediately invalidates the `products` cache tag so online shoppers never buy an item just sold on the Wuye floor.

---

## 4. Short-Let & Furnished Stay Concurrency Lock (`/stays`)
To prevent two guests from double-booking the 4-Bedroom Luxury Duplex at Prince & Princess Estate, Kaura District, Abuja (or any other managed short-let/furnished apartment):
1. Inside `db.transaction`, lock the target property row (`SELECT id FROM stay_properties WHERE id = $propertyId FOR UPDATE`).
2. Query `stay_blocked_dates` where `property_id = $propertyId AND start_date < $checkOutDate AND end_date > $checkInDate`.
3. If `overlappingRows.length > 0`, abort and return `ERR_STAY_DATES_UNAVAILABLE`.
4. When payment or Admin confirmation succeeds, insert the locked date range into `stay_blocked_dates`.

---

## 5. Reservation TTL & Abandoned Checkout Cleanup
- Every `PENDING_PAYMENT` retail order is stamped with `reservation_expires_at = NOW() + INTERVAL '15 minutes'`.
- The background route `/api/cron/release-stock` runs every 5 minutes, selecting all `PENDING_PAYMENT` orders where `reservation_expires_at < NOW() FOR UPDATE SKIP LOCKED`:
  - Restores `available_stock = available_stock + item.quantity` and `reserved_stock = reserved_stock - item.quantity`.
  - Marks the order status as `CANCELLED`.
