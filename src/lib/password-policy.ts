export const PASSWORD_MIN_LENGTH = 12;

const PASSWORD_RULES = [
  { test: (password: string) => /[a-z]/.test(password), label: "a lowercase letter" },
  { test: (password: string) => /[A-Z]/.test(password), label: "an uppercase letter" },
  { test: (password: string) => /\d/.test(password), label: "a number" },
  {
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
    label: "a symbol",
  },
] as const;

export function getPasswordPolicyError(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  const missing = PASSWORD_RULES.filter((rule) => !rule.test(password)).map(
    (rule) => rule.label,
  );

  if (missing.length > 0) {
    return `Include ${missing.join(", ")}.`;
  }

  return null;
}
