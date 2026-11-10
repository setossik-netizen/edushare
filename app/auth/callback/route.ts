import { NextResponse, type NextRequest } from "next/server";

import { safeNextPath } from "@/lib/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback des emails Supabase (confirmation d'inscription, réinitialisation).
 * Échange le code PKCE contre une session, puis redirige vers `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    return NextResponse.redirect(new URL("/connexion?erreur=lien-invalide", origin));
  }

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }

    console.error("[auth] exchangeCodeForSession:", error.message);
  }

  return NextResponse.redirect(new URL("/connexion?erreur=lien-invalide", origin));
}
