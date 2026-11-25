# Verification, Concurrency & E2E Testing Strategy
**Project:** LifestyleNG.com  
**Priority Level:** RECOMMENDED (Autonomous Self-Verification Harness for Antigravity IDE)

## 1. Unit Test Suite Targets (`Vitest` — `tests/unit/*.test.ts`)
The Antigravity agent must maintain 100% pass rates across these deterministic unit test suites:
1. **`tests/unit/money.test.ts`:**
   - Verifies kobo-to-Naira formatting (`5000000 kobo` -> `₦50,000`), cart subtotal summation, and duration-tier pricing for Shortlet vs. Weekly/Monthly Furnished Accommodation.
2. **`tests/unit/return-policy-24h.test.ts`:**
   - Tests boundary conditions for the **24-hour return policy**:
     - `receiptTimestamp + 23 hours 59 minutes 59 seconds` -> **ALLOWS** return request.
     - `receiptTimestamp + 24 hours 00 minutes 01 second` -> **REJECTS** with `ERR_RETURN_WINDOW_EXPIRED`.
3. **`tests/unit/car-hire-lead-time.test.ts`:**
   - Verifies that bookings with `pickupTime < NOW() + 2 hours` automatically set `isUnderTwoHoursNotice = true` to surface the 2-hour advance booking recommendation.
4. **`tests/unit/whatsapp-templates.test.ts`:**
   - Asserts that all 7 divisional WhatsApp builders generate valid `https://wa.me/2348064912969?text=...` URLs containing the mandatory business fields and MTN disclaimer.

---

## 2. Database Concurrency & Integration Tests (`tests/integration/*.test.ts`)
1. **Last-Unit Race Condition Test (`inventory-concurrency.test.ts`):**
   - Seeds a Wuye Boutique SKU (`available_stock = 1`).
   - Fires two concurrent `reserveInventoryForCheckout` calls via `Promise.allSettled([checkoutUserA(), checkoutWuyePosWalkInB()])`.
   - Asserts that **exactly one** succeeds (`available_stock = 0`, `reserved_stock = 1`) and **exactly one** fails with `ERR_INSUFFICIENT_STOCK` (zero negative stock).
2. **Kaura 4-Bedroom Duplex Double-Booking Test (`stay-overlap.test.ts`):**
   - Seeds a confirmed reservation for Nov 20 – Nov 24 on the Prince & Princess Estate 4-Bedroom Duplex.
   - Attempts a concurrent booking for Nov 22 – Nov 26 and asserts deterministic rejection with `ERR_STAY_DATES_UNAVAILABLE`.
3. **Paystack Webhook Replay Test (`webhook-idempotency.test.ts`):**
   - Sends the exact same signed `charge.success` payload 3 times in parallel to `/api/webhooks/paystack`.
   - Asserts `orders.status` transitions to `PAID` once, `webhook_events` stores 1 row, and stock is decremented only once.

---

## 3. Critical-Path E2E Playwright Suite (`tests/e2e/*.spec.ts`)
1. **`boutique-and-mtn-checkout.spec.ts`:**
   - Navigates `/` -> `/shop/clothes` -> Selects clothing/shoe variant -> Chooses `In-Store Pickup at Suite 83, H&A Plaza, Wuye` -> Acknowledges 24-hour return policy -> Completes Paystack test checkout -> Verifies Order Confirmation page.
2. **`mtn-fibrex-and-b2b.spec.ts`:**
   - Navigates `/mtn-services/fibrex` (and tests `/mtn-fibrex` redirect) -> Submits Abuja estate address -> Clicks **`CHECK FIBREX AVAILABILITY IN MY AREA`** -> Verifies database persistence and WhatsApp URL payload.
3. **`stays-and-property-mgmt.spec.ts`:**
   - Navigates `/stays` -> Selects dates on the Prince & Princess Estate 4-Bedroom Duplex calendar -> Submits reservation -> Switches to *Property & Apartment Management* tab and submits an owner onboarding request.
4. **`car-hire-airport-and-logistics.spec.ts`:**
   - Navigates `/car-hire` -> Tests Intra-City, Airport Transfer (with flight number), Inter-State Charter, and Cargo Logistics tabs -> Clicks **`BOOK A CAR ON WHATSAPP`**.
