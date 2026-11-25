import type { FulfillmentType, StayBookingMode } from '@/types';

export const KOBO_PER_NAIRA = 100;

export const DELIVERY_FEES_KOBO: Record<FulfillmentType, number> = {
  WUYE_IN_STORE_PICKUP: 0, // Free Click-and-Collect at Suite 83 / Block B70, H&A Plaza, Wuye, Abuja
  POS_WALK_IN: 0,
  ABUJA_DOORSTEP_DELIVERY: 350000, // ₦3,500 intra-Abuja doorstep delivery
  INTER_STATE_DELIVERY: 850000, // ₦8,500 nationwide inter-state courier delivery
};

export function assertIntegerKobo(kobo: number): void {
  if (!Number.isInteger(kobo) || kobo < 0) {
    throw new Error(
      `ERR_INVALID_KOBO_AMOUNT: Expected non-negative integer kobo, received ${kobo}`
    );
  }
}

export function nairaToKobo(nairaWholeOrExact: number): number {
  const kobo = Math.round(nairaWholeOrExact * KOBO_PER_NAIRA);
  assertIntegerKobo(kobo);
  return kobo;
}

export function koboToNairaWhole(kobo: number): number {
  assertIntegerKobo(kobo);
  return Math.round(kobo / KOBO_PER_NAIRA);
}

/**
 * Formats integer kobo into Nigerian Naira (₦) with zero floating-point drift.
 * Example: 5000000 kobo -> "₦50,000"
 */
export function formatKoboToNaira(kobo: number): string {
  assertIntegerKobo(kobo);
  const naira = Math.round(kobo / KOBO_PER_NAIRA);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(naira);
}

export function calculateCartSubtotalKobo(
  items: ReadonlyArray<{ unitPriceKobo: number; quantity: number }>
): number {
  let subtotal = 0;
  for (const item of items) {
    assertIntegerKobo(item.unitPriceKobo);
    if (!Number.isInteger(item.quantity) || item.quantity < 0) {
      throw new Error(`Invalid item quantity: ${item.quantity}`);
    }
    subtotal += item.unitPriceKobo * item.quantity;
  }
  return subtotal;
}

export function calculateOrderTotalKobo(params: {
  items: ReadonlyArray<{ unitPriceKobo: number; quantity: number }>;
  fulfillmentType: FulfillmentType;
}): {
  subtotalKobo: number;
  deliveryFeeKobo: number;
  totalAmountKobo: number;
} {
  const subtotalKobo = calculateCartSubtotalKobo(params.items);
  const deliveryFeeKobo =
    subtotalKobo > 0 ? DELIVERY_FEES_KOBO[params.fulfillmentType] : 0;
  return {
    subtotalKobo,
    deliveryFeeKobo,
    totalAmountKobo: subtotalKobo + deliveryFeeKobo,
  };
}

export interface StayPricingInput {
  checkInDate: string | Date;
  checkOutDate: string | Date;
  bookingMode: StayBookingMode;
  nightlyRateKobo: number;
  weeklyRateKobo: number;
  monthlyRateKobo: number;
  cautionDepositKobo: number;
}

export interface StayPricingQuote {
  nightsCount: number;
  appliedTier: 'NIGHTLY' | 'WEEKLY' | 'MONTHLY';
  staySubtotalKobo: number;
  cautionDepositKobo: number;
  totalAmountKobo: number;
}

/**
 * Computes deterministic integer kobo pricing for Short-Let Apartments and
 * Extended Weekly/Monthly Furnished Accommodation (/stays).
 */
export function calculateStayQuoteKobo(
  input: StayPricingInput
): StayPricingQuote {
  assertIntegerKobo(input.nightlyRateKobo);
  assertIntegerKobo(input.weeklyRateKobo);
  assertIntegerKobo(input.monthlyRateKobo);
  assertIntegerKobo(input.cautionDepositKobo);

  const checkIn =
    typeof input.checkInDate === 'string'
      ? new Date(input.checkInDate)
      : input.checkInDate;
  const checkOut =
    typeof input.checkOutDate === 'string'
      ? new Date(input.checkOutDate)
      : input.checkOutDate;

  const diffMs = checkOut.getTime() - checkIn.getTime();
  const nightsCount = Math.round(diffMs / (24 * 60 * 60 * 1000));

  if (nightsCount <= 0) {
    throw new Error('Check-out date must be at least 1 night after check-in.');
  }

  let appliedTier: 'NIGHTLY' | 'WEEKLY' | 'MONTHLY' = 'NIGHTLY';
  let staySubtotalKobo = input.nightlyRateKobo * nightsCount;

  if (nightsCount >= 28 && input.bookingMode === 'FURNISHED_ACCOMMODATION') {
    appliedTier = 'MONTHLY';
    const fullMonths = Math.floor(nightsCount / 28);
    const extraNights = nightsCount % 28;
    const proRataNightlyFromMonthly = Math.round(input.monthlyRateKobo / 28);
    staySubtotalKobo =
      fullMonths * input.monthlyRateKobo +
      extraNights * proRataNightlyFromMonthly;
  } else if (nightsCount >= 7) {
    appliedTier = 'WEEKLY';
    const fullWeeks = Math.floor(nightsCount / 7);
    const extraNights = nightsCount % 7;
    const proRataNightlyFromWeekly = Math.round(input.weeklyRateKobo / 7);
    staySubtotalKobo =
      fullWeeks * input.weeklyRateKobo + extraNights * proRataNightlyFromWeekly;
  }

  return {
    nightsCount,
    appliedTier,
    staySubtotalKobo,
    cautionDepositKobo: input.cautionDepositKobo,
    totalAmountKobo: staySubtotalKobo + input.cautionDepositKobo,
  };
}
