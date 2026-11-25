import { describe, expect, it } from 'vitest';
import { evaluateReturnWindow24h } from '@/lib/utils';

describe('Strict 24-Hour Return Policy Enforcement (src/lib/utils.ts)', () => {
  const receiptTimestamp = new Date('2026-11-16T12:00:00.000Z');

  it('ALLOWS return request at receiptTimestamp + 23 hours 59 minutes 59 seconds', () => {
    const nowAt23h59m59s = new Date(
      receiptTimestamp.getTime() + (23 * 3600 + 59 * 60 + 59) * 1000
    );
    const result = evaluateReturnWindow24h(receiptTimestamp, nowAt23h59m59s);

    expect(result.eligible).toBe(true);
    expect(result.errorCode).toBeNull();
  });

  it('REJECTS return request at receiptTimestamp + 24 hours 00 minutes 01 second with ERR_RETURN_WINDOW_EXPIRED', () => {
    const nowAt24h00m01s = new Date(
      receiptTimestamp.getTime() + (24 * 3600 + 1) * 1000
    );
    const result = evaluateReturnWindow24h(receiptTimestamp, nowAt24h00m01s);

    expect(result.eligible).toBe(false);
    expect(result.errorCode).toBe('ERR_RETURN_WINDOW_EXPIRED');
  });

  it('REJECTS return request when order has not been marked received yet', () => {
    const result = evaluateReturnWindow24h(null);
    expect(result.eligible).toBe(false);
    expect(result.errorCode).toBe('ERR_VALIDATION_FAILED');
  });
});
