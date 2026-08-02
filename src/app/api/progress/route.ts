import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { games, gameSlugs } from "@/lib/games";
import { calculateCurrentStreak, isDateKey } from "@/lib/progress";
import { getAuthenticatedContext } from "@/lib/supabase/auth";

async function getStats(
  supabase: SupabaseClient,
  userId: string,
  date: string,
) {
  const { data, error } = await supabase
    .from("game_progress")
    .select("play_date")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("play_date", { ascending: false });

  if (error) throw error;

  const completedRows = data ?? [];
  const activityDates = [...new Set(completedRows.map((row) => row.play_date))];

  return {
    streak: calculateCurrentStreak(activityDates, date),
    completedGames: completedRows.length,
  };
}

export async function GET(request: NextRequest) {
  const context = await getAuthenticatedContext();
  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");
  if (!isDateKey(date)) {
    return Response.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const [progressResult, preferenceResult, stats] = await Promise.all([
      context.supabase
        .from("game_progress")
        .select("game_slug, status")
        .eq("user_id", context.user.id)
        .eq("play_date", date),
      context.supabase
        .from("game_preferences")
        .select("game_slug, position, hidden")
        .eq("user_id", context.user.id)
        .order("position", { ascending: true }),
      getStats(context.supabase, context.user.id, date),
    ]);

    if (progressResult.error) throw progressResult.error;
    if (preferenceResult.error) throw preferenceResult.error;

    const preferences = preferenceResult.data ?? [];

    return Response.json({
      progress: progressResult.data ?? [],
      preferences:
        preferences.length > 0
          ? preferences.map((preference) => ({
              ...preference,
              hidden: preference.hidden ? 1 : 0,
            }))
          : games.map((game, position) => ({
              game_slug: game.slug,
              position,
              hidden: 0,
            })),
      stats,
    });
  } catch (error) {
    console.error("Failed to load progress", error);
    return Response.json({ error: "Could not load progress" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const context = await getAuthenticatedContext();
  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { gameSlug?: unknown; date?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body.gameSlug !== "string" ||
    !gameSlugs.has(body.gameSlug) ||
    !isDateKey(body.date) ||
    (body.status !== "started" && body.status !== "completed")
  ) {
    return Response.json({ error: "Invalid progress update" }, { status: 400 });
  }

  try {
    const { error } = await context.supabase.from("game_progress").upsert(
      {
        user_id: context.user.id,
        game_slug: body.gameSlug,
        play_date: body.date,
        status: body.status,
        completed_at: body.status === "completed" ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,game_slug,play_date" },
    );

    if (error) throw error;

    return Response.json({
      ok: true,
      stats: await getStats(context.supabase, context.user.id, body.date),
    });
  } catch (error) {
    console.error("Failed to save progress", error);
    return Response.json({ error: "Could not save progress" }, { status: 500 });
  }
}
