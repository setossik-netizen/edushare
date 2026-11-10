import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { SetupNotice } from "@/components/auth/setup-notice";
import { getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const instant = false;

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default async function ForgotPasswordPage() {
  await connection();
  const configured = isSupabaseConfigured();

  if (configured) {
    const user = await getSessionUser();
    if (user) redirect("/profil");
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      description="Saisissez l'adresse email de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe."
      footer={
        <>
          <Link href="/connexion" className="font-medium text-primary hover:underline">
            Revenir à la connexion
          </Link>
        </>
      }
    >
      {configured ? <ForgotPasswordForm /> : <SetupNotice />}
    </AuthShell>
  );
}
