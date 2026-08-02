import { NextRequest } from "next/server";
import { games, gameSlugs } from "@/lib/games";
import { getAuthenticatedContext } from "@/lib/supabase/auth";

export async function PUT(request: NextRequest) {
  const context = await getAuthenticatedContext();
  if (!context) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { preferences?: { gameSlug?: unknown; hidden?: unknown }[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !Array.isArray(body.preferences) ||
    body.preferences.length !== games.length ||
    new Set(body.preferences.map((item) => item.gameSlug)).size !== games.length ||
    body.preferences.some(
      (item) =>
        typeof item.gameSlug !== "string" ||
        !gameSlugs.has(item.gameSlug) ||
        typeof item.hidden !== "boolean",
    )
  ) {
    return Response.json({ error: "Invalid preferences" }, { status: 400 });
  }

  const items = body.preferences.map((preference, position) => ({
    game_slug: preference.gameSlug,
    position,
    hidden: preference.hidden,
  }));

  const { error } = await context.supabase.rpc("replace_game_preferences", {
    items,
  });

  if (error) {
    console.error("Failed to save preferences", error);
    return Response.json({ error: "Could not save preferences" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
