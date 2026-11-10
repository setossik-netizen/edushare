import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { FormAlert } from "@/components/auth/form-alert";
import { LoginForm } from "@/components/auth/login-form";
import { SetupNotice } from "@/components/auth/setup-notice";
import { getSessionUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const instant = false;

export const metadata: Metadata = { title: "Connexion" };

type LoginSearchParams = {
  next?: string;
  erreur?: string;
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  await connection();
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const configured = isSupabaseConfigured();

  if (configured) {
    const user = await getSessionUser();
    if (user) redirect(next);
  }

  return (
    <AuthShell
      title="Content de vous revoir"
      description="Connectez-vous pour retrouver vos contributions et accéder à toute la bibliothèque."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-primary hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {params.erreur === "lien-invalide" ? (
          <FormAlert>
            Ce lien de connexion est invalide ou a expiré. Demandez-en un nouveau.
          </FormAlert>
        ) : null}

        {configured ? <LoginForm next={next} /> : <SetupNotice />}
      </div>
    </AuthShell>
  );
}
