import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { getAuthenticatedContext } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const context = await getAuthenticatedContext();

  if (!context) {
    redirect("/login");
  }

  return <Dashboard user={context.user} />;
}
