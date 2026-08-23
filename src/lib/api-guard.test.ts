import assert from "node:assert/strict";
import test from "node:test";
import {
  checkRateLimit,
  isAllowedProgressDate,
  rateLimitHeaders,
} from "./api-guard.ts";

test("progress dates allow every possible user-local today", () => {
  const now = new Date("2026-08-23T12:00:00.000Z");

  assert.equal(isAllowedProgressDate("2026-08-22", now), true);
  assert.equal(isAllowedProgressDate("2026-08-23", now), true);
  assert.equal(isAllowedProgressDate("2026-08-24", now), true);
  assert.equal(isAllowedProgressDate("2026-08-21", now), false);
  assert.equal(isAllowedProgressDate("2026-08-25", now), false);
  assert.equal(isAllowedProgressDate("not-a-date", now), false);
});

test("rate limiter blocks requests over the limit and resets", () => {
  const key = "test-user:write";
  const first = checkRateLimit(key, 2, 60_000, 1_000);
  const second = checkRateLimit(key, 2, 60_000, 2_000);
  const blocked = checkRateLimit(key, 2, 60_000, 3_000);
  const reset = checkRateLimit(key, 2, 60_000, 61_000);

  assert.deepEqual(
    [first.allowed, second.allowed, blocked.allowed, reset.allowed],
    [true, true, false, true],
  );
  assert.equal(first.remaining, 1);
  assert.equal(second.remaining, 0);
  assert.equal(blocked.retryAfter, 58);
});

test("blocked rate-limit responses include Retry-After", () => {
  const key = "test-user:read";
  checkRateLimit(key, 1, 60_000, 10_000);
  const blocked = checkRateLimit(key, 1, 60_000, 20_000);

  assert.deepEqual(rateLimitHeaders(blocked), {
    "RateLimit-Limit": "1",
    "RateLimit-Remaining": "0",
    "RateLimit-Reset": "70",
    "Retry-After": "50",
  });
});
