import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAuthenticatedContext } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const configured = isSupabaseConfigured();
  const context = configured ? await getAuthenticatedContext() : null;

  if (context) {
    redirect("/");
  }

  return <AuthForm configured={configured} />;
}
