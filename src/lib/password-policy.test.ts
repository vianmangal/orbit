import assert from "node:assert/strict";
import test from "node:test";
import { getPasswordPolicyError } from "./password-policy.ts";

test("accepts a password that meets every rule", () => {
  assert.equal(getPasswordPolicyError("Orbit#Puzzle9"), null);
});

test("rejects passwords shorter than twelve characters", () => {
  assert.equal(getPasswordPolicyError("Short#1Aa"), "Use at least 12 characters.");
});

test("reports missing character classes", () => {
  assert.equal(
    getPasswordPolicyError("alllowercase"),
    "Include an uppercase letter, a number, a symbol.",
  );
});
