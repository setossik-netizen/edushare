import type { Metadata } from "next";
import { connection } from "next/server";

import { UploadForm } from "@/components/upload-form";
import { SetupNotice } from "@/components/auth/setup-notice";
import { getLevels, requireUser } from "@/lib/auth";
import { getSubjects } from "@/lib/resources";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Partager un document",
  description: "Envoyez un cours, un exercice ou une annale (PDF ou image).",
};

export const instant = false;

export default async function SharePage() {
  await connection();

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <SetupNotice />
      </div>
    );
  }

  const user = await requireUser("/partager");
  const [levels, subjects] = await Promise.all([getLevels(), getSubjects()]);
  const isContributor = user.isContributor;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Partager un document</h1>
        <p className="text-muted-foreground">
          Votre dépôt sera vérifié par un modérateur. Dès son approbation, votre compte est
          débloqué.
        </p>
      </div>

      {!isContributor ? (
        <div className="mt-6 rounded-xl border border-amber-300/60 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/5 dark:text-amber-200">
          Votre accès est encore verrouillé. Ce premier document, s&apos;il est approuvé, le
          débloquera.
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm text-foreground">
          Vous êtes contributeur validé. Merci de continuer à enrichir le fonds commun.
        </div>
      )}

      <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
        <UploadForm levels={levels} subjects={subjects} />
      </div>
    </div>
  );
}
