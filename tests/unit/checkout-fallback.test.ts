import { describe, expect, it } from 'vitest';
import { createCheckoutSessionSchema } from '@/lib/validations/contracts';
import {
  initializeCheckoutAction,
  submitStayBookingAction,
} from '@/server/actions';
import { SEED_FASHION_PRODUCTS } from '@/lib/db/seed-data';

describe('Zero-Trust Checkout, Empty Cart Guard & Sandbox/Manual Payment Fallback', () => {
  const sampleVariant = SEED_FASHION_PRODUCTS[0]!.variants[0]!;

  it('accepts BANK_TRANSFER, SANDBOX, PAYSTACK, and FLUTTERWAVE in createCheckoutSessionSchema', () => {
    for (const paymentProvider of [
      'BANK_TRANSFER',
      'SANDBOX',
      'PAYSTACK',
      'FLUTTERWAVE',
    ] as const) {
      const parsed = createCheckoutSessionSchema.safeParse({
        customerName: 'Amaka Obi',
        customerEmail: 'amaka@example.com',
        customerPhone: '+2348064912969',
        fulfillmentType: 'WUYE_IN_STORE_PICKUP',
        paymentProvider,
        returnPolicyAcknowledged: true,
      });
      expect(parsed.success).toBe(true);
    }
  });

  it('rejects empty cart cleanly with ERR_VALIDATION_FAILED instead of charging a hardcoded fallback', async () => {
    const res = await initializeCheckoutAction(
      {
        customerName: 'Amaka Obi',
        customerEmail: 'amaka@example.com',
        customerPhone: '+2348064912969',
        fulfillmentType: 'WUYE_IN_STORE_PICKUP',
        paymentProvider: 'BANK_TRANSFER',
        returnPolicyAcknowledged: true,
      },
      []
    );

    expect(res.data).toBeNull();
    expect(res.error?.code).toBe('ERR_VALIDATION_FAILED');
    expect(res.error?.message.toLowerCase()).toContain('empty');
  });

  it('creates a BANK_TRANSFER manual order with MANUAL_ reference, ₦0 Wuye pickup fee, and WhatsApp fallback URL', async () => {
    const res = await initializeCheckoutAction(
      {
        customerName: 'Amaka Obi',
        customerEmail: 'amaka@example.com',
        customerPhone: '08064912969',
        fulfillmentType: 'WUYE_IN_STORE_PICKUP',
        paymentProvider: 'BANK_TRANSFER',
        returnPolicyAcknowledged: true,
      },
      [{ variantId: sampleVariant.id, quantity: 1 }]
    );

    expect(res.error).toBeNull();
    expect(res.data).not.toBeNull();
    expect(res.data?.paymentMode).toBe('MANUAL');
    expect(res.data?.reference).toMatch(/^MANUAL_LNG-ORD-/);
    expect(res.data?.deliveryFeeKobo).toBe(0);
    expect(res.data?.totalAmountKobo).toBe(sampleVariant.priceKobo);
    expect(res.data?.authorizationUrl).toContain('method=BANK_TRANSFER');
    expect(res.data?.whatsappFallbackUrl).toContain('https://wa.me/2348064912969');
  });

  it('completes explicit SANDBOX test mode with Abuja doorstep delivery fee (₦3,500) and zero missing-key errors', async () => {
    const res = await initializeCheckoutAction(
      {
        customerName: 'Tunde Bello',
        customerEmail: 'tunde@example.com',
        customerPhone: '+2348064912969',
        fulfillmentType: 'ABUJA_DOORSTEP_DELIVERY',
        shippingAddress: {
          streetAddress: '14 Aminu Kano Crescent',
          districtOrCity: 'Wuse II, Abuja',
          state: 'FCT - Abuja',
        },
        paymentProvider: 'SANDBOX',
        sandboxMode: true,
        returnPolicyAcknowledged: true,
      },
      [{ variantId: sampleVariant.id, quantity: 1 }]
    );

    expect(res.error).toBeNull();
    expect(res.data?.paymentMode).toBe('SANDBOX');
    expect(res.data?.reference).toMatch(/^SANDBOX_LNG-ORD-/);
    expect(res.data?.deliveryFeeKobo).toBe(350000);
    expect(res.data?.totalAmountKobo).toBe(sampleVariant.priceKobo + 350000);
    expect(res.data?.authorizationUrl).toContain('method=SANDBOX');
  });

  it('gracefully falls back PAYSTACK and FLUTTERWAVE to sandbox verification when live keys are unset', async () => {
    const pstkRes = await initializeCheckoutAction(
      {
        customerName: 'Chidi Nnaji',
        customerEmail: 'chidi@example.com',
        customerPhone: '+2348064912969',
        fulfillmentType: 'WUYE_IN_STORE_PICKUP',
        paymentProvider: 'PAYSTACK',
        returnPolicyAcknowledged: true,
      },
      [{ variantId: sampleVariant.id, quantity: 1 }]
    );

    expect(pstkRes.error).toBeNull();
    expect(pstkRes.data?.paymentMode).toBe('SANDBOX');
    expect(pstkRes.data?.reference).toMatch(/^PSTK_SANDBOX_LNG-ORD-/);
    expect(pstkRes.data?.authorizationUrl).toContain('method=PAYSTACK_SANDBOX');

    const flwRes = await initializeCheckoutAction(
      {
        customerName: 'Chidi Nnaji',
        customerEmail: 'chidi@example.com',
        customerPhone: '+2348064912969',
        fulfillmentType: 'WUYE_IN_STORE_PICKUP',
        paymentProvider: 'FLUTTERWAVE',
        returnPolicyAcknowledged: true,
      },
      [{ variantId: sampleVariant.id, quantity: 1 }]
    );

    expect(flwRes.error).toBeNull();
    expect(flwRes.data?.paymentMode).toBe('SANDBOX');
    expect(flwRes.data?.reference).toMatch(/^FLW_SANDBOX_LNG-ORD-/);
    expect(flwRes.data?.authorizationUrl).toContain(
      'method=FLUTTERWAVE_SANDBOX'
    );
  });

  it('computes accurate room-level nightly pricing on submitStayBookingAction when roomId is provided', async () => {
    const res = await submitStayBookingAction({
      propertyId: '31111111-1111-4111-8111-111111111101',
      roomId: 'room-kaura-deluxe-1',
      guestName: 'Ngozi Eze',
      guestEmail: 'ngozi@example.com',
      guestPhone: '+2348064912969',
      bookingMode: 'SHORT_LET',
      checkInDate: '2026-12-01',
      checkOutDate: '2026-12-03', // 2 nights * ₦58,000 + ₦50,000 caution = ₦166,000
      guestsCount: 2,
    });

    expect(res.error).toBeNull();
    expect(res.data?.totalAmountKobo).toBe(16600000);
    expect(decodeURIComponent(res.data?.whatsappConfirmUrl ?? '')).toContain(
      'Deluxe Room 1'
    );
  });
});
