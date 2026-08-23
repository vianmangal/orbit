"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { getPasswordPolicyError, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import { createClient } from "@/lib/supabase/client";
import styles from "./auth-form.module.css";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const policyError = getPasswordPolicyError(password);
    if (policyError) {
      setError(policyError);
      return;
    }

    if (password !== confirmation) {
      setError("The passwords don’t match.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message || "We couldn’t update your password.");
        return;
      }

      await supabase.auth.signOut();
      setComplete(true);
    } catch {
      setError("We couldn’t update your password. Please request a new reset link.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.story}>
        <BrandMark />
        <div className={styles.storyCopy}>
          <div className={styles.eyebrow}>
            <Sparkles size={15} /> Secure account recovery
          </div>
          <h1>A fresh key<br />to your orbit.</h1>
          <p>
            Choose a strong new password. Your puzzle history and streaks will
            stay exactly where you left them.
          </p>
        </div>
        <p className={styles.footnote}>This recovery link can only be used once</p>
      </section>

      <section className={styles.authPanel}>
        <div className={styles.mobileBrand}><BrandMark /></div>
        <div className={styles.formWrap}>
          <div className={styles.heading}>
            <h2>{complete ? "Password updated" : "Choose a new password"}</h2>
            <p>
              {complete
                ? "Your account is secure. Sign in again with your new password."
                : "Use 12 or more characters with uppercase, lowercase, a number, and a symbol."}
            </p>
          </div>

          {complete ? (
            <>
              <p className={styles.success} role="status">
                <Check size={15} /> Your password was changed successfully.
              </p>
              <Link className={styles.submit} href="/login">
                Continue to sign in <ArrowRight size={18} />
              </Link>
            </>
          ) : (
            <form onSubmit={submit} className={styles.form}>
              <label>
                <span>New password</span>
                <div className={styles.passwordField}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={PASSWORD_MIN_LENGTH}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="12+ chars: upper, lower, number & symbol"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <label>
                <span>Confirm new password</span>
                <input
                  name="confirmation"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="Enter it once more"
                />
              </label>

              {error && <p className={styles.error} role="alert">{error}</p>}

              <button className={styles.submit} type="submit" disabled={pending}>
                {pending ? "Updating password…" : "Update password"}
                {!pending && <ArrowRight size={18} />}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
