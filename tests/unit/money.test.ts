import { describe, expect, it } from 'vitest';
import {
  calculateCartSubtotalKobo,
  calculateOrderTotalKobo,
  calculateStayQuoteKobo,
  formatKoboToNaira,
  koboToNairaWhole,
  nairaToKobo,
} from '@/lib/money';

describe('Money & Kobo Integer Ledger (src/lib/money.ts)', () => {
  it('formats 5000000 kobo as ₦50,000 without floating-point drift', () => {
    const formatted = formatKoboToNaira(5000000);
    expect(formatted).toContain('50,000');
    expect(formatted).toContain('₦');
  });

  it('converts between Naira and integer Kobo deterministically', () => {
    expect(nairaToKobo(145000)).toBe(14500000);
    expect(koboToNairaWhole(14500000)).toBe(145000);
  });

  it('calculates cart subtotals and ₦0 Wuye Click-and-Collect pickup fee', () => {
    const items = [
      { unitPriceKobo: 14500000, quantity: 1 },
      { unitPriceKobo: 9500000, quantity: 2 },
    ];
    expect(calculateCartSubtotalKobo(items)).toBe(33500000);

    const wuyePickupOrder = calculateOrderTotalKobo({
      items,
      fulfillmentType: 'WUYE_IN_STORE_PICKUP',
    });
    expect(wuyePickupOrder.deliveryFeeKobo).toBe(0);
    expect(wuyePickupOrder.totalAmountKobo).toBe(33500000);

    const abujaDeliveryOrder = calculateOrderTotalKobo({
      items,
      fulfillmentType: 'ABUJA_DOORSTEP_DELIVERY',
    });
    expect(abujaDeliveryOrder.deliveryFeeKobo).toBe(350000);
    expect(abujaDeliveryOrder.totalAmountKobo).toBe(33850000);
  });

  it('computes Short-Let nightly vs Weekly/Monthly Furnished Accommodation rates for Kaura 4-Bed Duplex', () => {
    const nightlyQuote = calculateStayQuoteKobo({
      checkInDate: '2026-12-01',
      checkOutDate: '2026-12-04', // 3 nights
      bookingMode: 'SHORT_LET',
      nightlyRateKobo: 18500000,
      weeklyRateKobo: 115000000,
      monthlyRateKobo: 420000000,
      cautionDepositKobo: 5000000,
    });
    expect(nightlyQuote.nightsCount).toBe(3);
    expect(nightlyQuote.appliedTier).toBe('NIGHTLY');
    expect(nightlyQuote.staySubtotalKobo).toBe(55500000);
    expect(nightlyQuote.totalAmountKobo).toBe(60500000);

    const monthlyQuote = calculateStayQuoteKobo({
      checkInDate: '2026-12-01',
      checkOutDate: '2026-12-29', // 28 nights
      bookingMode: 'FURNISHED_ACCOMMODATION',
      nightlyRateKobo: 18500000,
      weeklyRateKobo: 115000000,
      monthlyRateKobo: 420000000,
      cautionDepositKobo: 5000000,
    });
    expect(monthlyQuote.nightsCount).toBe(28);
    expect(monthlyQuote.appliedTier).toBe('MONTHLY');
    expect(monthlyQuote.staySubtotalKobo).toBe(420000000);
    expect(monthlyQuote.totalAmountKobo).toBe(425000000);
  });
});
