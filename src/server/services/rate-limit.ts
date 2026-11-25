const rateLimitBuckets = new Map<
  string,
  { count: number; windowStartMs: number }
>();

export interface RateLimitConfig {
  bucketKey: string;
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(config: RateLimitConfig): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const existing = rateLimitBuckets.get(config.bucketKey);

  if (!existing || now - existing.windowStartMs > config.windowMs) {
    rateLimitBuckets.set(config.bucketKey, {
      count: 1,
      windowStartMs: now,
    });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
  };
}
