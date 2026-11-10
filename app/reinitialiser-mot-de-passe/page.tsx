import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { SetupNotice } from "@/components/auth/setup-notice";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const instant = false;

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default async function ResetPasswordPage() {
  await connection();
  const configured = isSupabaseConfigured();
  const user = configured ? await getSessionUser() : null;

  return (
    <AuthShell
      title="Choisir un nouveau mot de passe"
      description="Votre lien de réinitialisation vous connecte temporairement. Choisissez un mot de passe de 8 caractères minimum."
    >
      {!configured ? (
        <SetupNotice />
      ) : user ? (
        <ResetPasswordForm />
      ) : (
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>Ce lien de réinitialisation est invalide ou a expiré.</p>
          <Link href="/mot-de-passe-oublie" className={buttonVariants()}>
            Demander un nouveau lien
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
