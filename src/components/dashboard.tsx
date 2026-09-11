"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Circle,
  ExternalLink,
  Flame,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Game, GameCategory, games, gameSlugs } from "@/lib/games";
import { calculateCurrentStreak } from "@/lib/progress";
import styles from "./dashboard.module.css";

type ProgressStatus = "started" | "completed";

type ProgressByDate = Record<string, Record<string, ProgressStatus>>;

const STORAGE_KEY = "orbit-progress-v1";

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

function loadLocalProgress(): ProgressByDate {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};

    const progress: ProgressByDate = {};
    for (const [date, statuses] of Object.entries(value)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !statuses || typeof statuses !== "object") {
        continue;
      }

      const validStatuses: Record<string, ProgressStatus> = {};
      for (const [slug, status] of Object.entries(statuses)) {
        if (gameSlugs.has(slug) && (status === "started" || status === "completed")) {
          validStatuses[slug] = status;
        }
      }
      progress[date] = validStatuses;
    }
    return progress;
  } catch {
    return {};
  }
}

export function Dashboard() {
  const [date, setDate] = useState("");
  const [progressByDate, setProgressByDate] = useState<ProgressByDate>({});
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDate(localDateKey());
      setProgressByDate(loadLocalProgress());
      setLoading(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const visibleGames = games;
  const statusBySlug = date ? progressByDate[date] ?? {} : {};
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
  const completedDates = Object.entries(progressByDate)
    .filter(([, statuses]) => Object.values(statuses).includes("completed"))
    .map(([progressDate]) => progressDate);
  const stats = {
    streak: date ? calculateCurrentStreak(completedDates, date) : 0,
    completedGames: Object.values(progressByDate).reduce(
      (total, statuses) =>
        total + Object.values(statuses).filter((status) => status === "completed").length,
      0,
    ),
  };

  function updateProgress(gameSlug: string, status: ProgressStatus) {
    if (!date) return;

    setProgressByDate((current) => {
      const next = {
        ...current,
        [date]: { ...current[date], [gameSlug]: status },
      };

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        setNotice("Your browser could not save that update.");
      }

      return next;
    });
  }

  function openGame(game: Game) {
    if (!date) return;
    if (!statusBySlug[game.slug]) {
      updateProgress(game.slug, "started");
    }
    window.open(game.url, "_blank", "noopener,noreferrer");
  }

  function toggleCompleted(game: Game) {
    if (!date) return;
    const nextStatus =
      statusBySlug[game.slug] === "completed" ? "started" : "completed";
    updateProgress(game.slug, nextStatus);
  }

  if (loading) {
    return (
      <div className={styles.page} aria-busy="true" aria-label="Loading your games">
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <BrandMark />
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
          <span className={styles.srOnly}>Loading your games and local progress...</span>
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
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.welcome}>
          <div>
            <h1>Your game routine.</h1>
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
                      <h3>{game.name}</h3>
                      <p>{game.description}</p>
                    </div>
                    <div className={styles.cardFooter}>
                      <button type="button" onClick={() => openGame(game)}>
                        {status === "started" ? "Continue" : completed ? "Play again" : "Play"}
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
            Orbit is an independent launcher and is not affiliated with or endorsed by the listed game publishers.
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
