# Zero-Trust Checkout, Payment Gateways & Webhook Idempotency
**Project:** LifestyleNG.com  
**Recommended Gateways:** Paystack (Primary) & Flutterwave (Secondary Fallback)  
**Priority Level:** CRITICAL (Prevents Price Manipulation & Duplicate Fulfillment)

## 1. Zero-Trust Server Calculation Mandate
The server must **never** accept item prices, subtotals, delivery fees, or shortlet nightly/weekly/monthly rates from client request payloads:
1. **Retail Orders (`/shop/clothes` & MTN Telecom Products):**
   - Fetch `product_variants.price_kobo` directly from PostgreSQL for each `variantId` in the user's cart.
   - Calculate `subtotal_kobo = SUM(variant.price_kobo * item.quantity)`.
   - Compute `delivery_fee_kobo` server-side based on `fulfillmentType`:
     - `WUYE_IN_STORE_PICKUP` (Suite 83 / Block B70, H&A Plaza, Wuye, Abuja): `0 kobo` (`₦0`).
     - `ABUJA_DOORSTEP_DELIVERY`: Configured flat or district rate in `kobo`.
     - `INTER_STATE_DELIVERY`: Configured state-zone rate in `kobo`.
2. **Hospitality Bookings (`/stays`):**
   - Compute `nightsCount = differenceInCalendarDays(checkOutDate, checkInDate)`.
   - Apply `monthlyRateKobo` (if `nightsCount >= 28` and `bookingMode === 'FURNISHED_ACCOMMODATION'`), `weeklyRateKobo` (if `nightsCount >= 7`), or `nightlyRateKobo * nightsCount`, plus `cautionDepositKobo`.

---

## 2. Cryptographic Webhook Signature Verification
Both webhook endpoints must read the raw unparsed request body (`await req.text()`) before parsing JSON.

### 2.1 Paystack Webhook Handler (`src/app/api/webhooks/paystack/route.ts`)
```typescript
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { env } from '@/env';
import { processIdempotentPaymentWebhook } from '@/server/services/payment-reconciler';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  const expectedHash = crypto
    .createHmac('sha512', env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  if (
    expectedHash.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(signature))
  ) {
    return NextResponse.json({ error: 'Invalid cryptographic signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'charge.success') {
    await processIdempotentPaymentWebhook({
      provider: 'PAYSTACK',
      providerEventId: String(event.data.id),
      eventType: event.event,
      reference: String(event.data.reference),
      amountPaidKobo: Number(event.data.amount), // Paystack natively sends kobo
      rawPayload: event,
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
```

### 2.2 Flutterwave Webhook Handler (`src/app/api/webhooks/flutterwave/route.ts`)
- Validates `req.headers.get('verif-hash')` using `crypto.timingSafeEqual` against `env.FLUTTERWAVE_WEBHOOK_SECRET_HASH`.
- Converts Flutterwave's Naira amount to integer kobo (`Math.round(Number(event.data.amount) * 100)`) and verifies the transaction status via a server-to-server `GET https://api.flutterwave.com/v3/transactions/{id}/verify` call before calling `processIdempotentPaymentWebhook`.

---

## 3. Atomic Webhook Idempotency & Out-of-Order Reconciliation
When Paystack or Flutterwave retries a webhook or when a webhook arrives before the customer's browser reaches `/checkout/verify`:
1. Begin a PostgreSQL transaction (`db.transaction`).
2. Attempt to insert `{ provider, providerEventId, eventType, payload }` into `webhook_events` with `.onConflictDoNothing()`.
3. If no row is returned (meaning `providerEventId` was already processed), commit immediately and return HTTP `200`.
4. Lock the target `orders` (or `stay_bookings`) row via `SELECT ... FOR UPDATE`.
5. **Amount & Currency Integrity Check:** Verify that `amountPaidKobo >= order.totalAmountKobo`. If there is a mismatch, flag the transaction as `AMOUNT_MISMATCH_HOLD` and alert Admin without marking the order `PAID`.
6. **If `order.status === 'PENDING_PAYMENT'`:**
   - Update `orders.status = 'PAID'` and `orders.paidAt = NOW()`.
   - Deduct `reserved_stock = reserved_stock - item.quantity` across all `order_items` (making the inventory deduction permanent).
7. **If `order.status === 'CANCELLED'` (e.g., delayed bank transfer completed after the 15-minute reservation window expired):**
   - Attempt to re-decrement `available_stock`. If stock is still available, transition to `PAID`; if stock was bought by someone else in the meantime, transition to `PAID_REQUIRES_ADMIN_RESOLUTION` and trigger an urgent Admin alert.
