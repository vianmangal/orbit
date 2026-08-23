"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { getPasswordPolicyError, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import { createClient } from "@/lib/supabase/client";
import styles from "./auth-form.module.css";

export function AuthForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up" | "forgot">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setPending(true);

    try {
      const supabase = createClient();

      if (mode === "forgot") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo: `${window.location.origin}/auth/reset-confirm` },
        );

        if (resetError) {
          setError("We couldn’t send a reset link right now. Please try again shortly.");
          return;
        }

        setMessage(
          "If an account exists for that email, a password reset link is on its way.",
        );
        return;
      }

      if (mode === "sign-up") {
        const policyError = getPasswordPolicyError(password);
        if (policyError) {
          setError(policyError);
          return;
        }
      }

      const result =
        mode === "sign-up"
          ? await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: {
                data: { name: name.trim() },
                emailRedirectTo: `${window.location.origin}/auth/confirm`,
              },
            })
          : await supabase.auth.signInWithPassword({
              email: email.trim(),
              password,
            });

      if (result.error) {
        setError(
          result.error.message ||
            (mode === "sign-up"
              ? "We couldn’t create that account."
              : "That email and password don’t match."),
        );
        return;
      }

      if (mode === "sign-up" && !result.data.session) {
        setMessage("Check your email to confirm your account, then sign in.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Authentication is not configured yet. Add the Supabase project keys first.");
    } finally {
      setPending(false);
    }
  }

  function changeMode(nextMode: "sign-in" | "sign-up" | "forgot") {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  return (
    <main className={styles.page}>
      <section className={styles.story}>
        <BrandMark />
        <div className={styles.storyCopy}>
          <h1>Just simply write your game routine.</h1>
          <p>
            Keep every daily puzzle in one calm place, remember what you played,
            and watch your streak grow.
          </p>
        </div>
        <p className={styles.footnote}>Independent launcher · Your progress stays yours</p>
      </section>

      <section className={styles.authPanel}>
        <div className={styles.mobileBrand}><BrandMark /></div>
        <div className={styles.formWrap}>
          <div className={styles.tabs} role="tablist" aria-label="Account action">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "sign-in"}
              className={mode === "sign-in" ? styles.activeTab : ""}
              onClick={() => changeMode("sign-in")}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "sign-up"}
              className={mode === "sign-up" ? styles.activeTab : ""}
              onClick={() => changeMode("sign-up")}
            >
              Create account
            </button>
          </div>

          <div className={styles.heading}>
            <h2>
              {mode === "sign-in"
                ? "Welcome back"
                : mode === "sign-up"
                  ? "Start your orbit"
                  : "Reset your password"}
            </h2>
            <p>
              {mode === "sign-in"
                ? "Your puzzles are right where you left them."
                : mode === "sign-up"
                  ? "One account keeps your daily progress in sync."
                  : "Enter your email and we’ll send you a secure reset link."}
            </p>
          </div>

          <form onSubmit={submit} className={styles.form}>
            {mode === "sign-up" && (
              <label>
                <span>Name</span>
                <input
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="How should we greet you?"
                />
              </label>
            )}

            <label>
              <span>Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            {mode !== "forgot" && (
              <label>
                <span>Password</span>
                <div className={styles.passwordField}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                    required
                    minLength={mode === "sign-up" ? PASSWORD_MIN_LENGTH : 8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={
                      mode === "sign-up"
                        ? "12+ chars: upper, lower, number & symbol"
                        : "Your password"
                    }
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
            )}

            {mode === "sign-in" && (
              <button
                type="button"
                className={styles.textButton}
                onClick={() => changeMode("forgot")}
              >
                Forgot password?
              </button>
            )}

            {!configured && (
              <p className={styles.error} role="alert">
                Add your Supabase project URL and publishable key to .env.local to enable login.
              </p>
            )}
            {error && <p className={styles.error} role="alert">{error}</p>}
            {message && <p className={styles.success} role="status">{message}</p>}

            <button className={styles.submit} type="submit" disabled={pending || !configured}>
              {pending
                ? "Just a moment…"
                : mode === "sign-in"
                  ? "Enter your orbit"
                  : mode === "sign-up"
                    ? "Create my account"
                    : "Send reset link"}
              {!pending && <ArrowRight size={18} />}
            </button>

            {mode === "forgot" && (
              <button
                type="button"
                className={styles.backButton}
                onClick={() => changeMode("sign-in")}
              >
                Back to sign in
              </button>
            )}
          </form>

          <p className={styles.legalLinks}>
            By using Orbit, you agree to the <Link href="/terms">Terms</Link> and acknowledge
            the <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
