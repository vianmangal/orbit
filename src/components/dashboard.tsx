"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  LogOut,
  Moon,
  Settings2,
  Sparkles,
  Sun,
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
  preferences: { game_slug: string; position: number; hidden: number }[];
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

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function GameGlyph({ game }: { game: Game }) {
  const letters: Record<Game["icon"], string> = {
    flag: "FL",
    angle: "∠",
    globe: "◎",
    capital: "⌂",
    word: "W",
    tiles: "◇",
    connections: "4×4",
    strands: "S",
  };

  return (
    <span
      className={styles.gameGlyph}
      style={{ "--game-accent": game.accent } as React.CSSProperties}
      aria-hidden="true"
    >
      {letters[game.icon]}
    </span>
  );
}

export function Dashboard({
  user,
}: {
  user: { name: string; email: string };
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [salutation, setSalutation] = useState("Hello");
  const [statusBySlug, setStatusBySlug] = useState<Record<string, ProgressStatus>>({});
  const [orderedGames, setOrderedGames] = useState(games);
  const [hiddenSlugs, setHiddenSlugs] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ streak: 0, completedGames: 0 });
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [dark, setDark] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDate(localDateKey());
      setSalutation(greeting());
      const savedTheme = localStorage.getItem("daily-orbit-theme");
      const wantsDark =
        savedTheme === "dark" ||
        (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDark(wantsDark);
      document.documentElement.classList.toggle("dark", wantsDark);
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

        const positions = new Map(
          data.preferences.map((item) => [item.game_slug, item.position]),
        );
        setOrderedGames(
          [...games].sort(
            (a, b) => (positions.get(a.slug) ?? 99) - (positions.get(b.slug) ?? 99),
          ),
        );
        setHiddenSlugs(
          new Set(
            data.preferences
              .filter((item) => item.hidden === 1)
              .map((item) => item.game_slug),
          ),
        );
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

  useEffect(() => {
    if (!settingsOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSettingsOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [settingsOpen]);

  const visibleGames = useMemo(
    () => orderedGames.filter((game) => !hiddenSlugs.has(game.slug)),
    [hiddenSlugs, orderedGames],
  );
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
  const remainingMinutes = visibleGames
    .filter((game) => statusBySlug[game.slug] !== "completed")
    .reduce((total, game) => total + game.minutes, 0);

  const formattedDate = date
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(new Date(`${date}T12:00:00`))
    : "Today";

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

  function moveGame(index: number, direction: -1 | 1) {
    const next = [...orderedGames];
    const destination = index + direction;
    if (destination < 0 || destination >= next.length) return;
    [next[index], next[destination]] = [next[destination], next[index]];
    setOrderedGames(next);
  }

  function toggleHidden(slug: string) {
    setHiddenSlugs((current) => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else if (orderedGames.length - next.size > 1) {
        next.add(slug);
      } else {
        setNotice("Keep at least one game in your daily lineup.");
      }
      return next;
    });
  }

  async function savePreferences() {
    setSavingSettings(true);
    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: orderedGames.map((game) => ({
            gameSlug: game.slug,
            hidden: hiddenSlugs.has(game.slug),
          })),
        }),
      });
      if (!response.ok) throw new Error("Could not save preferences");
      setSettingsOpen(false);
      setNotice("Your lineup has been updated.");
    } catch {
      setNotice("Your lineup couldn’t be saved. Please try again.");
    } finally {
      setSavingSettings(false);
    }
  }

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("daily-orbit-theme", next ? "dark" : "light");
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
            <button type="button" onClick={() => setSettingsOpen(true)}>My lineup</button>
          </nav>
          <div className={styles.accountActions}>
            <button className={styles.iconButton} type="button" onClick={toggleTheme} aria-label={dark ? "Use light theme" : "Use dark theme"}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
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
            <p className={styles.date}>{formattedDate}</p>
            <h1>{salutation}, {user.name.split(" ")[0]}.</h1>
            <p className={styles.subtitle}>A little brain stretch, all in one place.</p>
          </div>
          <button className={styles.customizeButton} type="button" onClick={() => setSettingsOpen(true)}>
            <Settings2 size={17} /> Customize lineup
          </button>
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
                  : `${remainingMinutes} min of puzzles left in today’s lineup.`}
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
                      <GameGlyph game={game} />
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
                      <span><Clock3 size={14} /> ~{game.minutes} min</span>
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

      {settingsOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setSettingsOpen(false)}>
          <section className={styles.settingsPanel} role="dialog" aria-modal="true" aria-labelledby="settings-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.settingsHeader}>
              <div>
                <p>Your routine</p>
                <h2 id="settings-title">Customize lineup</h2>
              </div>
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings"><X size={20} /></button>
            </div>
            <p className={styles.settingsIntro}>Put favorites first or hide games you don’t play. Your progress stays saved.</p>
            <div className={styles.settingsList}>
              {orderedGames.map((game, index) => {
                const hidden = hiddenSlugs.has(game.slug);
                return (
                  <div className={`${styles.settingsRow} ${hidden ? styles.hiddenRow : ""}`} key={game.slug}>
                    <GameGlyph game={game} />
                    <div><strong>{game.name}</strong><span>{game.category}</span></div>
                    <div className={styles.orderButtons}>
                      <button type="button" disabled={index === 0} onClick={() => moveGame(index, -1)} aria-label={`Move ${game.name} up`}><ArrowUp size={16} /></button>
                      <button type="button" disabled={index === orderedGames.length - 1} onClick={() => moveGame(index, 1)} aria-label={`Move ${game.name} down`}><ArrowDown size={16} /></button>
                    </div>
                    <button className={styles.visibilityButton} type="button" onClick={() => toggleHidden(game.slug)} aria-label={hidden ? `Show ${game.name}` : `Hide ${game.name}`}>
                      {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className={styles.settingsFooter}>
              <span>{visibleGames.length} games in your lineup</span>
              <button type="button" onClick={savePreferences} disabled={savingSettings}>
                {savingSettings ? "Saving…" : "Save lineup"} <ChevronRight size={16} />
              </button>
            </div>
          </section>
        </div>
      )}

      {notice && (
        <button className={styles.notice} type="button" onClick={() => setNotice("")} aria-live="polite">
          {notice}<X size={15} />
        </button>
      )}
    </div>
  );
}
