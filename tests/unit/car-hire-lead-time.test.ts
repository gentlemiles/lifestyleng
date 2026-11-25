import { describe, expect, it } from 'vitest';
import { evaluateCarHireLeadTime } from '@/lib/utils';

describe('Car Hire 2-Hour Advance Notice Rule (src/lib/utils.ts)', () => {
  const now = new Date('2026-11-17T10:00:00.000Z');

  it('flags bookings with pickupTime < NOW() + 2 hours with isUnderTwoHoursNotice = true', () => {
    const pickupIn90Mins = new Date(now.getTime() + 90 * 60 * 1000);
    const evaluation = evaluateCarHireLeadTime(pickupIn90Mins, now);

    expect(evaluation.isUnderTwoHoursNotice).toBe(true);
    expect(evaluation.recommendationNotice).toContain('2 hours in advance');
  });

  it('marks bookings >= 2 hours in advance with isUnderTwoHoursNotice = false', () => {
    const pickupIn3Hours = new Date(now.getTime() + 180 * 60 * 1000);
    const evaluation = evaluateCarHireLeadTime(pickupIn3Hours, now);

    expect(evaluation.isUnderTwoHoursNotice).toBe(false);
    expect(evaluation.recommendationNotice).toBeNull();
  });
});
