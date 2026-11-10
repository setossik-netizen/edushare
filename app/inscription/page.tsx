import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth/auth-shell";
import { SetupNotice } from "@/components/auth/setup-notice";
import { SignUpForm } from "@/components/auth/signup-form";
import { getLevels, getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const instant = false;

export const metadata: Metadata = { title: "Créer un compte" };

export default async function SignUpPage() {
  await connection();
  const configured = isSupabaseConfigured();

  if (configured) {
    const user = await getSessionUser();
    if (user) redirect("/profil");
  }

  const levels = configured ? await getLevels() : [];

  return (
    <AuthShell
      title="Créer un compte gratuit"
      description="Deux minutes suffisent. Partagez un document validé pour débloquer toute la bibliothèque."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      {configured ? <SignUpForm levels={levels} /> : <SetupNotice />}
    </AuthShell>
  );
}
