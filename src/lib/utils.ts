import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
export const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export interface ReturnWindowEvaluation {
  eligible: boolean;
  elapsedMs: number;
  remainingMs: number;
  remainingHours: number;
  errorCode: 'ERR_RETURN_WINDOW_EXPIRED' | 'ERR_VALIDATION_FAILED' | null;
  message: string;
}

/**
 * Deterministic 24-Hour Return Policy evaluator per docs/FULFILLMENT_AND_NOTIFICATIONS.md.
 * Returns are strictly eligible within 24 hours (86,400,000 ms) of receipt (deliveredAt or pickedUpAt).
 */
export function evaluateReturnWindow24h(
  receiptTimestamp: Date | null | undefined,
  nowTimestamp: Date = new Date()
): ReturnWindowEvaluation {
  if (!receiptTimestamp) {
    return {
      eligible: false,
      elapsedMs: 0,
      remainingMs: 0,
      remainingHours: 0,
      errorCode: 'ERR_VALIDATION_FAILED',
      message: 'Order has not been marked received yet.',
    };
  }

  const elapsedMs = nowTimestamp.getTime() - receiptTimestamp.getTime();
  if (elapsedMs < 0) {
    return {
      eligible: true,
      elapsedMs: 0,
      remainingMs: TWENTY_FOUR_HOURS_MS,
      remainingHours: 24,
      errorCode: null,
      message: 'Eligible for 24-hour return.',
    };
  }

  if (elapsedMs > TWENTY_FOUR_HOURS_MS) {
    return {
      eligible: false,
      elapsedMs,
      remainingMs: 0,
      remainingHours: 0,
      errorCode: 'ERR_RETURN_WINDOW_EXPIRED',
      message:
        'Return window closed. Returns must be initiated within 24 hours of receipt.',
    };
  }

  const remainingMs = TWENTY_FOUR_HOURS_MS - elapsedMs;
  const remainingHours = Number((remainingMs / (60 * 60 * 1000)).toFixed(2));

  return {
    eligible: true,
    elapsedMs,
    remainingMs,
    remainingHours,
    errorCode: null,
    message: `Eligible for return (${remainingHours}h remaining).`,
  };
}

export interface CarHireLeadTimeEvaluation {
  isUnderTwoHoursNotice: boolean;
  leadTimeMs: number;
  leadTimeMinutes: number;
  recommendationNotice: string | null;
}

/**
 * Evaluates the 2-Hour Minimum Advance Booking recommendation for Lifestyle Logistics (/car-hire).
 */
export function evaluateCarHireLeadTime(
  pickupTimestamp: Date | string,
  nowTimestamp: Date = new Date()
): CarHireLeadTimeEvaluation {
  const pickupDate =
    typeof pickupTimestamp === 'string'
      ? new Date(pickupTimestamp)
      : pickupTimestamp;
  const leadTimeMs = pickupDate.getTime() - nowTimestamp.getTime();
  const leadTimeMinutes = Math.floor(leadTimeMs / (60 * 1000));
  const isUnderTwoHoursNotice = leadTimeMs < TWO_HOURS_MS;

  return {
    isUnderTwoHoursNotice,
    leadTimeMs,
    leadTimeMinutes,
    recommendationNotice: isUnderTwoHoursNotice
      ? 'We recommend booking at least 2 hours in advance for guaranteed vehicle staging. Urgent dispatch will be prioritized via WhatsApp.'
      : null,
  };
}

export function generateReferenceCode(prefix: string): string {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `LNG-${prefix}-${datePart}-${randomPart}`;
}
