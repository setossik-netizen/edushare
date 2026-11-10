import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ShieldCheck } from "lucide-react";

import { SetupNotice } from "@/components/auth/setup-notice";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { requireStaff } from "@/lib/auth";
import { getPendingResources, getReports } from "@/lib/resources";
import { moderateResourceAction, resolveReportAction } from "@/lib/actions/resources";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Modération" };
export const instant = false;

const REJECTION_REASONS = [
  { value: "ILLISIBLE", label: "Document illisible" },
  { value: "DOUBLON", label: "Doublon" },
  { value: "MAUVAISE_CLASSIFICATION", label: "Mauvaise classification" },
  { value: "INCOMPLET", label: "Document incomplet" },
  { value: "INAPPROPRIE", label: "Contenu inapproprié" },
  { value: "DROIT_AUTEUR", label: "Droit d'auteur suspect" },
];

export default async function AdminPage() {
  await connection();

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <SetupNotice />
      </div>
    );
  }

  await requireStaff("/admin");
  const [pending, reports] = await Promise.all([getPendingResources(), getReports()]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">File de modération</h1>
          <p className="text-muted-foreground">
            {pending.total} document{pending.total > 1 ? "s" : ""} en attente de validation.
          </p>
        </div>
      </div>

      {pending.items.length === 0 ? (
        <Card className="mt-8 border-dashed bg-muted/20">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Aucun document en attente</CardTitle>
            <CardDescription>La file de modération est vide.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {pending.items.map((resource) => (
            <Card key={resource.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>
                      {resource.author.username} · {resource.level.label} · {resource.subject.label} ·{" "}
                      {resource.type} · {resource.year}
                    </CardDescription>
                  </div>
                  <a
                    href={resource.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Ouvrir sur Google Drive
                  </a>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{resource.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <form action={moderateResourceAction} className="flex flex-1 gap-2">
                    <input type="hidden" name="resourceId" value={resource.id} />
                    <input type="hidden" name="decision" value="APPROVE" />
                    <Button type="submit" className="flex-1">
                      Approuver
                    </Button>
                  </form>

                  <form action={moderateResourceAction} className="flex flex-1 flex-col gap-2 sm:flex-row">
                    <input type="hidden" name="resourceId" value={resource.id} />
                    <input type="hidden" name="decision" value="REJECT" />
                    <NativeSelect name="reason" required className="flex-1">
                      <option value="">Motif de rejet</option>
                      {REJECTION_REASONS.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </NativeSelect>
                    <Button type="submit" variant="destructive">
                      Rejeter
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Signalements ouverts</h2>
        {reports.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Aucun signalement ouvert.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {reports.map((report: { id: string; reason: string; comment: string | null; resource_id: string; resources: { title: string }[] }) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {report.resources?.[0]?.title ?? "Ressource supprimée"}
                  </CardTitle>
                  <CardDescription>
                    Motif : {report.reason}
                    {report.comment ? ` — ${report.comment}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Link
                    href={`/ressource/${report.resource_id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Voir la ressource
                  </Link>
                  <form action={resolveReportAction}>
                    <input type="hidden" name="reportId" value={report.id} />
                    <Button type="submit" size="sm" variant="ghost">
                      Marquer résolu
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
