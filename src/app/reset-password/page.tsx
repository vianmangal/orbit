import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { getAuthenticatedContext } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const context = await getAuthenticatedContext();
  if (!context) {
    redirect("/login?recovery=expired");
  }

  return <ResetPasswordForm />;
}
