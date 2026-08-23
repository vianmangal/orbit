import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import {
  checkRateLimit,
  isAllowedProgressDate,
  rateLimitHeaders,
} from "@/lib/api-guard";
import { gameSlugs } from "@/lib/games";
import { calculateCurrentStreak } from "@/lib/progress";
import { getAuthenticatedContext } from "@/lib/supabase/auth";

const RATE_LIMIT_WINDOW_MS = 60_000;
const READ_RATE_LIMIT = 120;
const WRITE_RATE_LIMIT = 30;

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

  const rateLimit = checkRateLimit(
    `progress:read:${context.user.id}`,
    READ_RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  );
  const headers = rateLimitHeaders(rateLimit);
  if (!rateLimit.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429, headers });
  }

  const date = request.nextUrl.searchParams.get("date");
  if (!isAllowedProgressDate(date)) {
    return Response.json({ error: "Date is outside the allowed range" }, { status: 400, headers });
  }

  try {
    const [progressResult, stats] = await Promise.all([
      context.supabase
        .from("game_progress")
        .select("game_slug, status")
        .eq("user_id", context.user.id)
        .eq("play_date", date),
      getStats(context.supabase, context.user.id, date),
    ]);

    if (progressResult.error) throw progressResult.error;

    return Response.json(
      {
        progress: progressResult.data ?? [],
        stats,
      },
      { headers },
    );
  } catch (error) {
    console.error("Failed to load progress", error);
    return Response.json({ error: "Could not load progress" }, { status: 500, headers });
  }
}

export async function POST(request: NextRequest) {
  const context = await getAuthenticatedContext();
  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(
    `progress:write:${context.user.id}`,
    WRITE_RATE_LIMIT,
    RATE_LIMIT_WINDOW_MS,
  );
  const headers = rateLimitHeaders(rateLimit);
  if (!rateLimit.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429, headers });
  }

  let body: { gameSlug?: unknown; date?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400, headers });
  }

  if (
    typeof body.gameSlug !== "string" ||
    !gameSlugs.has(body.gameSlug) ||
    !isAllowedProgressDate(body.date) ||
    (body.status !== "started" && body.status !== "completed")
  ) {
    return Response.json({ error: "Invalid progress update" }, { status: 400, headers });
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

    return Response.json(
      {
        ok: true,
        stats: await getStats(context.supabase, context.user.id, body.date),
      },
      { headers },
    );
  } catch (error) {
    console.error("Failed to save progress", error);
    return Response.json({ error: "Could not save progress" }, { status: 500, headers });
  }
}
