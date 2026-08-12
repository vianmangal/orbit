"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Circle,
  ExternalLink,
  Flame,
  LogOut,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Game, GameCategory, games } from "@/lib/games";
import { createClient } from "@/lib/supabase/client";
import styles from "./dashboard.module.css";

type ProgressStatus = "started" | "completed";

type ProgressResponse = {
  progress: { game_slug: string; status: ProgressStatus }[];
  stats: { streak: number; completedGames: number };
};

const categories: Array<"All" | GameCategory> = [
  "All",
  "Geography",
  "Words & logic",
  "Visual",
];

function localDateKey() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function Dashboard({
  user,
}: {
  user: { name: string; email: string };
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [statusBySlug, setStatusBySlug] = useState<Record<string, ProgressStatus>>({});
  const [stats, setStats] = useState({ streak: 0, completedGames: 0 });
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDate(localDateKey());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();

    async function loadProgress() {
      try {
        const response = await fetch(`/api/progress?date=${date}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Could not load progress");
        const data = (await response.json()) as ProgressResponse;
        setStatusBySlug(
          Object.fromEntries(data.progress.map((item) => [item.game_slug, item.status])),
        );
        setStats(data.stats);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setNotice("Your progress couldn’t be loaded. Try refreshing the page.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadProgress();
    return () => controller.abort();
  }, [date]);

  const visibleGames = games;
  const filteredGames = visibleGames.filter(
    (game) => filter === "All" || game.category === filter,
  );
  const completedCount = visibleGames.filter(
    (game) => statusBySlug[game.slug] === "completed",
  ).length;
  const progressPercent = visibleGames.length
    ? Math.round((completedCount / visibleGames.length) * 100)
    : 0;
  const nextGame = visibleGames.find(
    (game) => statusBySlug[game.slug] !== "completed",
  );
  async function updateProgress(gameSlug: string, status: ProgressStatus) {
    const previousStatus = statusBySlug[gameSlug];
    const completedDelta =
      status === "completed" && previousStatus !== "completed"
        ? 1
        : status !== "completed" && previousStatus === "completed"
          ? -1
          : 0;
    setStatusBySlug((current) => ({ ...current, [gameSlug]: status }));
    if (completedDelta !== 0) {
      setStats((current) => ({
        ...current,
        completedGames: Math.max(0, current.completedGames + completedDelta),
      }));
    }

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSlug, date, status }),
      });
      if (!response.ok) throw new Error("Could not save progress");
      const data = (await response.json()) as {
        stats: { streak: number; completedGames: number };
      };
      setStats(data.stats);
    } catch {
      setStatusBySlug((current) => {
        const next = { ...current };
        if (previousStatus) next[gameSlug] = previousStatus;
        else delete next[gameSlug];
        return next;
      });
      if (completedDelta !== 0) {
        setStats((current) => ({
          ...current,
          completedGames: Math.max(0, current.completedGames - completedDelta),
        }));
      }
      setNotice("That update didn’t save. Please try again.");
    }
  }

  function openGame(game: Game) {
    if (!date) return;
    if (!statusBySlug[game.slug]) {
      void updateProgress(game.slug, "started");
    }
    window.open(game.url, "_blank", "noopener,noreferrer");
  }

  function toggleCompleted(game: Game) {
    if (!date) return;
    const nextStatus =
      statusBySlug[game.slug] === "completed" ? "started" : "completed";
    void updateProgress(game.slug, nextStatus);
  }

  async function signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setNotice("Sign out failed. Please try again.");
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className={styles.page} aria-busy="true" aria-label="Loading your games">
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <BrandMark />
            <div className={styles.accountActions}>
              <div className={styles.avatar} title={user.email}>
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className={styles.main}>
          <div className={`${styles.loadingBlock} ${styles.loadingTitle}`} />
          <div className={`${styles.loadingBlock} ${styles.loadingSummary}`} />
          <div className={styles.loadingGrid}>
            {games.slice(0, 4).map((game) => (
              <div className={`${styles.loadingBlock} ${styles.loadingCard}`} key={game.slug} />
            ))}
          </div>
          <span className={styles.srOnly}>Loading your account and game progress…</span>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <BrandMark />
          <nav className={styles.nav} aria-label="Primary navigation">
            <span className={styles.activeNav}>Today</span>
          </nav>
          <div className={styles.accountActions}>
            <div className={styles.avatar} title={user.email}>
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <button className={styles.iconButton} type="button" onClick={signOut} aria-label="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.welcome}>
          <div>
            <h1>Welcome, {user.name.split(" ")[0]}.</h1>
            <p className={styles.subtitle}>A little brain stretch, all in one place.</p>
          </div>
        </section>

        <section className={styles.summary} aria-label="Daily progress">
          <div className={styles.summaryMain}>
            <div className={styles.summaryLabel}>
              <span><Sparkles size={15} /> Today’s orbit</span>
              <strong>{completedCount} of {visibleGames.length} complete</strong>
            </div>
            <div className={styles.progressTrack} aria-label={`${progressPercent}% complete`}>
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <div className={styles.summaryBottom}>
              <p>
                {completedCount === visibleGames.length
                  ? "Orbit complete. Nicely done."
                  : `${visibleGames.length - completedCount} games left in your lineup.`}
              </p>
              {nextGame ? (
                <button type="button" onClick={() => openGame(nextGame)}>
                  Continue with {nextGame.name} <ArrowRight size={16} />
                </button>
              ) : (
                <span className={styles.completeMessage}><Check size={16} /> All done</span>
              )}
            </div>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}><Flame size={20} /></span>
            <div><strong>{stats.streak}</strong><span>day streak</span></div>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}><Trophy size={20} /></span>
            <div><strong>{stats.completedGames}</strong><span>games finished</span></div>
          </div>
        </section>

        <section className={styles.library}>
          <div className={styles.libraryHeader}>
            <div>
              <h2>Today’s games</h2>
              <p>Open the original game, then mark it complete here.</p>
            </div>
            <div className={styles.filters} aria-label="Filter games">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={filter === category ? styles.activeFilter : ""}
                  onClick={() => setFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className={styles.gameGrid} aria-label="Loading games">
              {games.slice(0, 6).map((game) => <div key={game.slug} className={styles.skeleton} />)}
            </div>
          ) : filteredGames.length > 0 ? (
            <div className={styles.gameGrid}>
              {filteredGames.map((game) => {
                const status = statusBySlug[game.slug];
                const completed = status === "completed";
                return (
                  <article
                    className={`${styles.gameCard} ${completed ? styles.completedCard : ""}`}
                    key={game.slug}
                    style={{ "--game-accent": game.accent } as React.CSSProperties}
                  >
                    <div className={styles.cardTop}>
                      <button
                        type="button"
                        className={`${styles.completionButton} ${completed ? styles.checked : ""}`}
                        onClick={() => toggleCompleted(game)}
                        aria-label={completed ? `Mark ${game.name} incomplete` : `Mark ${game.name} complete`}
                      >
                        {completed ? <Check size={16} /> : <Circle size={16} />}
                        {completed ? "Done" : "Mark done"}
                      </button>
                    </div>
                    <div className={styles.cardCopy}>
                      <span className={styles.category}>{game.category}</span>
                      <h3>{game.name}</h3>
                      <p>{game.description}</p>
                    </div>
                    <div className={styles.cardFooter}>
                      <button type="button" onClick={() => openGame(game)}>
                        {status === "started" ? "Continue" : completed ? "Play again" : "Play original"}
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No visible games in this category.</p>
              <button type="button" onClick={() => setFilter("All")}>Show all games</button>
            </div>
          )}

          <p className={styles.disclaimer}>
            Daily Orbit is an independent launcher and is not affiliated with or endorsed by the listed game publishers.
            Games open on their official websites.
          </p>
        </section>
      </main>

      {notice && (
        <button className={styles.notice} type="button" onClick={() => setNotice("")} aria-live="polite">
          {notice}<X size={15} />
        </button>
      )}
    </div>
  );
}
