"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { createClient } from "@/lib/supabase/client";
import styles from "./auth-form.module.css";

export function AuthForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
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

  function changeMode(nextMode: "sign-in" | "sign-up") {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  return (
    <main className={styles.page}>
      <section className={styles.story}>
        <BrandMark />
        <div className={styles.storyCopy}>
          <div className={styles.eyebrow}>
            <Sparkles size={15} /> Your daily game ritual
          </div>
          <h1>Eight games.<br />One lovely routine.</h1>
          <p>
            Keep every daily puzzle in one calm place, remember what you played,
            and watch your streak grow.
          </p>
          <div className={styles.preview} aria-hidden="true">
            <div className={styles.previewHeader}>
              <span>Today’s orbit</span><strong>3 of 8</strong>
            </div>
            <div className={styles.previewBar}><span /></div>
            <div className={styles.previewCards}>
              <span>FL</span><span>AN</span><span>GL</span><span>+5</span>
            </div>
          </div>
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
            <h2>{mode === "sign-in" ? "Welcome back" : "Start your orbit"}</h2>
            <p>
              {mode === "sign-in"
                ? "Your puzzles are right where you left them."
                : "One account keeps your daily progress in sync."}
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

            <label>
              <span>Password</span>
              <div className={styles.passwordField}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === "sign-up" ? "At least 8 characters" : "Your password"}
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
                  : "Create my account"}
              {!pending && <ArrowRight size={18} />}
            </button>
          </form>

          <div className={styles.reassurance}>
            <Check size={15} /> No newsletters. No social account required.
          </div>
        </div>
      </section>
    </main>
  );
}
