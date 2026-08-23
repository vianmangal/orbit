import { isDateKey, shiftDate } from "./progress.ts";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const current = buckets.get(key);
  const bucket =
    !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

  const allowed = bucket.count < limit;
  if (allowed) bucket.count += 1;
  buckets.set(key, bucket);

  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
    retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.allowed ? {} : { "Retry-After": String(result.retryAfter) }),
  };
}

export function isAllowedProgressDate(
  value: unknown,
  now = new Date(),
): value is string {
  if (!isDateKey(value)) return false;

  const utcToday = now.toISOString().slice(0, 10);
  return (
    value === shiftDate(utcToday, -1) ||
    value === utcToday ||
    value === shiftDate(utcToday, 1)
  );
}
