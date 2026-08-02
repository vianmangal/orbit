import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateCurrentStreak,
  isDateKey,
  shiftDate,
} from "./progress.ts";

test("shiftDate handles month boundaries", () => {
  assert.equal(shiftDate("2026-08-01", -1), "2026-07-31");
});

test("streak includes today when active", () => {
  assert.equal(
    calculateCurrentStreak(
      ["2026-08-02", "2026-08-01", "2026-07-31"],
      "2026-08-02",
    ),
    3,
  );
});

test("streak remains alive until the current day is completed", () => {
  assert.equal(
    calculateCurrentStreak(["2026-08-01", "2026-07-31"], "2026-08-02"),
    2,
  );
});

test("date keys reject impossible values", () => {
  assert.equal(isDateKey("2026-08-02"), true);
  assert.equal(isDateKey("2026-02-31"), false);
  assert.equal(isDateKey("tomorrow"), false);
  assert.equal(isDateKey(20260802), false);
});
