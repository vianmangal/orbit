import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedContext() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims as Record<string, unknown> | undefined;
  const id = claims?.sub;

  if (error || !claims || typeof id !== "string") return null;

  const email = typeof claims.email === "string" ? claims.email : "";
  const metadata =
    claims.user_metadata && typeof claims.user_metadata === "object"
      ? (claims.user_metadata as Record<string, unknown>)
      : {};
  const metadataName =
    typeof metadata.name === "string" ? metadata.name.trim() : "";

  return {
    supabase,
    user: {
      id,
      email,
      name: metadataName || email.split("@")[0] || "Player",
    },
  };
}
