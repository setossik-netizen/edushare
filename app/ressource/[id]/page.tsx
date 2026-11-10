import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Heart,
  Lock,
  Share2,
} from "lucide-react";
import { notFound } from "next/navigation";

import { FormAlert } from "@/components/auth/form-alert";
import { PdfViewerLazy as PdfViewer } from "@/components/pdf-viewer-lazy";
import { SetupNotice } from "@/components/auth/setup-notice";
import { ToggleFavoriteButton } from "@/components/toggle-favorite-button";
import { ReportDialog } from "@/components/report-dialog";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import {
  canDownload,
  getFavoriteIds,
  getResource,
  incrementViewCount,
  resourceTypeLabel,
} from "@/lib/resources";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resource = await getResource(id);
  if (!resource) return { title: "Ressource introuvable" };
  return {
    title: resource.title,
    description: resource.description.slice(0, 160),
  };
}

type ResourcePageParams = { id: string };
type ResourceSearchParams = { signalement?: string };

export default async function ResourcePage({
  params,
  searchParams,
}: {
  params: Promise<ResourcePageParams>;
  searchParams: Promise<ResourceSearchParams>;
}) {
  await connection();
  const { id } = await params;
  const sp = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <SetupNotice />
      </div>
    );
  }

  const [resource, user] = await Promise.all([getResource(id), getSessionUser()]);
  if (!resource) notFound();

  const favoriteIds = user ? await getFavoriteIds(user.id) : new Set<string>();

  const isOwner = resource.author.id === user?.id;
  const isStaff = user?.role === "moderator" || user?.role === "admin";

  if (resource.status !== "APPROVED" && !isOwner && !isStaff) {
    notFound();
  }

  if (resource.status === "APPROVED") {
    await incrementViewCount(resource.id);
  }

  const userCanDownload = canDownload(user) && resource.status === "APPROVED";
  const previewMaxPages = userCanDownload ? null : 3;
  const previewUrl = `/api/preview/${resource.id}`;
  const initials = resource.author.username.slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/explorer"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour au catalogue
      </Link>

      {sp.signalement === "ok" ? (
        <FormAlert tone="success" className="mt-4">
          Signalement envoyé. Merci de votre vigilance.
        </FormAlert>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{resourceTypeLabel(resource.type)}</Badge>
                <Badge variant="outline">{resource.level.label}</Badge>
                <Badge variant="outline">{resource.subject.label}</Badge>
                <Badge variant="outline">{resource.year}</Badge>
                {resource.status !== "APPROVED" ? (
                  <Badge
                    variant={resource.status === "PENDING" ? "secondary" : "destructive"}
                  >
                    {resource.status === "PENDING" ? "En attente" : "Rejeté"}
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="mt-3 text-2xl tracking-tight">{resource.title}</CardTitle>
              <CardDescription className="leading-relaxed">{resource.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span
                    className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary"
                    aria-hidden="true"
                  >
                    {initials}
                  </span>
                  {resource.author.username}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="size-4" aria-hidden="true" />
                  {resource.pageCount} page{resource.pageCount > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Download className="size-4" aria-hidden="true" />
                  {resource.downloadCount} téléchargement{resource.downloadCount > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="size-4" aria-hidden="true" />
                  {resource.viewCount} vue{resource.viewCount > 1 ? "s" : ""}
                </span>
              </div>

              {resource.school ? (
                <p className="text-sm text-muted-foreground">
                  Établissement : <span className="font-medium text-foreground">{resource.school}</span>
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lecteur PDF</CardTitle>
              <CardDescription>
                {userCanDownload
                  ? "Lecture intégrale. Utilisez les contrôles pour naviguer et zoomer."
                  : "Aperçu limité aux 3 premières pages. Partagez un document pour débloquer l'intégralité."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PdfViewer src={previewUrl} maxPages={previewMaxPages} />

              {!userCanDownload && resource.pageCount > 3 ? (
                <div className="mt-4 rounded-lg border border-dashed bg-muted/30 p-4 text-center">
                  <Lock className="mx-auto size-5 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-2 text-sm font-medium">Contenu verrouillé</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Partagez un document validé pour lire les {resource.pageCount - 3} pages
                    restantes et télécharger le PDF.
                  </p>
                  <Link href="/partager" className={buttonVariants({ className: "mt-3" })}>
                    <Share2 aria-hidden="true" />
                    Partager un document
                  </Link>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userCanDownload ? (
                <a
                  href={`/api/download/${resource.id}`}
                  className={buttonVariants({ className: "w-full" })}
                >
                  <Download aria-hidden="true" />
                  Télécharger le PDF
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className={buttonVariants({ className: "w-full", variant: "secondary" })}
                  title="Partagez un document pour débloquer le téléchargement"
                >
                  <Lock aria-hidden="true" />
                  Téléchargement verrouillé
                </button>
              )}

              {user ? (
                <ToggleFavoriteButton resourceId={resource.id} initialFavorite={favoriteIds.has(resource.id)} />
              ) : (
                <Link
                  href={`/connexion?next=${encodeURIComponent(`/ressource/${resource.id}`)}`}
                  className={buttonVariants({ variant: "outline", className: "w-full" })}
                >
                  <Heart aria-hidden="true" />
                  Se connecter pour mettre en favori
                </Link>
              )}

              {user ? <ReportDialog resourceId={resource.id} /> : null}
            </CardContent>
          </Card>

          {resource.rejectionReason && (isOwner || isStaff) ? (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base">Motif de rejet</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {resource.rejectionReason}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
