import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { CheckCircle2, Clock, FileUp, Library, XCircle } from "lucide-react";

import { SetupNotice } from "@/components/auth/setup-notice";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getUserResources as fetchUserResources } from "@/lib/resources";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resourceTypeLabel } from "@/lib/resources";

export const metadata: Metadata = { title: "Mes contributions" };
export const instant = false;

const STATUS_META: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof Clock }> = {
  PENDING: { label: "En attente", variant: "secondary", icon: Clock },
  APPROVED: { label: "Approuvé", variant: "default", icon: CheckCircle2 },
  REJECTED: { label: "Rejeté", variant: "destructive", icon: XCircle },
};

export default async function ContributionsPage() {
  await connection();

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <SetupNotice />
      </div>
    );
  }

  const user = await requireUser("/mes-contributions");
  const result = await fetchUserResources(user.id);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Mes contributions</h1>
        <p className="text-muted-foreground">
          Suivez l&apos;état de vos documents partagés.
        </p>
      </div>

      {result.items.length === 0 ? (
        <Card className="mt-8 border-dashed bg-muted/20">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Aucun document partagé</CardTitle>
            <CardDescription className="mx-auto max-w-md leading-relaxed">
              Vous n&apos;avez pas encore publié de cours ou d&apos;exercice. Partagez votre
              premier document pour lancer votre compte contributeur.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center gap-2 pb-6 sm:flex-row">
            <Link href="/partager" className={buttonVariants()}>
              <FileUp aria-hidden="true" />
              Partager un document
            </Link>
            <Link href="/explorer" className={buttonVariants({ variant: "outline" })}>
              <Library aria-hidden="true" />
              Explorer le catalogue
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-3">
          {result.items.map((resource) => {
            const meta = STATUS_META[resource.status] ?? STATUS_META.PENDING;
            const Icon = meta.icon;
            return (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <CardDescription>
                        {resourceTypeLabel(resource.type)} · {resource.subject.label} ·{" "}
                        {resource.level.label} · {resource.year}
                      </CardDescription>
                    </div>
                    <Badge variant={meta.variant} className="gap-1">
                      <Icon className="size-3" aria-hidden="true" />
                      {meta.label}
                    </Badge>
                  </div>
                  {resource.status === "REJECTED" && resource.rejectionReason ? (
                    <p className="mt-2 text-sm text-destructive">
                      Motif : {resource.rejectionReason}
                    </p>
                  ) : null}
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {resource.status === "APPROVED" ? (
                    <Link
                      href={`/ressource/${resource.id}`}
                      className={buttonVariants({ size: "sm" })}
                    >
                      Voir la ressource
                    </Link>
                  ) : null}
                  <Link
                    href="/partager"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Partager un autre
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
