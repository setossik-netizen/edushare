import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import {
  CheckCircle2,
  FileUp,
  GraduationCap,
  Library,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { FormAlert } from "@/components/auth/form-alert";
import { SetupNotice } from "@/components/auth/setup-notice";
import { ProfileForm } from "@/components/profile-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLevels, requireUser } from "@/lib/auth";
import { getFavorites, getNotifications } from "@/lib/resources";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const instant = false;

export const metadata: Metadata = { title: "Mon profil" };

type ProfileSearchParams = {
  "mot-de-passe"?: string;
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<ProfileSearchParams>;
}) {
  await connection();

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <SetupNotice />
      </div>
    );
  }

  const user = await requireUser("/profil");
  const [levels, params, favorites, notifications] = await Promise.all([
    getLevels(),
    searchParams,
    getFavorites(user.id),
    getNotifications(user.id),
  ]);
  const levelLabel = levels.find((level) => level.id === user.currentLevelId)?.label;
  const initials = user.username.slice(0, 2).toUpperCase();
  const roleLabel =
    user.role === "admin" ? "Administrateur" : user.role === "moderator" ? "Modérateur" : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Mon profil</h1>
        <p className="text-muted-foreground">
          Votre identité publique, votre statut de contributeur et vos informations.
        </p>
      </div>

      {params["mot-de-passe"] === "mis-a-jour" ? (
        <FormAlert tone="success" className="mt-6">
          Votre mot de passe a bien été mis à jour.
        </FormAlert>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
              <span
                className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary"
                aria-hidden="true"
              >
                {initials}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight">{user.username}</h2>
                  {user.isContributor ? (
                    <Badge className="gap-1">
                      <CheckCircle2 className="size-3" aria-hidden="true" />
                      Contributeur
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Non-contributeur</Badge>
                  )}
                  {roleLabel ? (
                    <Badge variant="outline" className="gap-1">
                      <ShieldCheck className="size-3" aria-hidden="true" />
                      {roleLabel}
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Mail className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{user.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <GraduationCap className="size-4 shrink-0" aria-hidden="true" />
                    {levelLabel ?? "Classe non précisée"}
                  </p>
                </div>

                {user.bio ? (
                  <p className="mt-3 text-pretty text-sm text-muted-foreground">{user.bio}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations du profil</CardTitle>
              <CardDescription>
                Votre pseudo est visible sur chaque document que vous publiez.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} levels={levels} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mes favoris</CardTitle>
              <CardDescription>Vos ressources sauvegardées.</CardDescription>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun favori pour le moment.
                </p>
              ) : (
                <ul className="space-y-2">
                  {favorites.map((resource) => (
                    <li key={resource.id}>
                      <Link
                        href={`/ressource/${resource.id}`}
                        className="block rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
                      >
                        <p className="font-medium">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {resource.subject.label} · {resource.level.label}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {user.isContributor ? (
            <Card className="border-primary/25 bg-primary/5 ring-primary/15">
              <CardHeader>
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="mt-3 text-lg">Compte débloqué</CardTitle>
                <CardDescription className="leading-relaxed">
                  Vous avez au moins une ressource approuvée : lecture intégrale et
                  téléchargement sont ouverts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/explorer" className={buttonVariants({ className: "w-full" })}>
                  <Library aria-hidden="true" />
                  Explorer la bibliothèque
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-300/60 bg-amber-50/70 dark:border-amber-400/30 dark:bg-amber-400/5">
              <CardHeader>
                <span className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  <Lock className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="mt-3 text-lg">Accès verrouillé</CardTitle>
                <CardDescription className="leading-relaxed">
                  Partagez un document de qualité. Dès qu&apos;un modérateur l&apos;approuve,
                  votre compte est débloqué automatiquement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/partager" className={buttonVariants({ className: "w-full" })}>
                  <FileUp aria-hidden="true" />
                  Partager un document
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Votre activité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-muted-foreground">Ressources approuvées</span>
                <span className="text-2xl font-semibold">{user.approvedCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t pt-4">
                <span className="text-sm text-muted-foreground">Statut</span>
                <span className="text-sm font-medium">
                  {user.isContributor ? "Débloqué" : "En attente de contribution"}
                </span>
              </div>
              <div className="border-t pt-4">
                <Link
                  href="/mes-contributions"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Voir mes contributions
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {notifications.length === 0 ? (
                <p className="text-muted-foreground">Aucune notification.</p>
              ) : (
                <ul className="space-y-2">
                  {notifications.map((notification: { id: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string }) => (
                    <li key={notification.id} className="rounded-lg border p-3">
                      <p className="font-medium">{notification.title}</p>
                      {notification.body ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {notification.body}
                        </p>
                      ) : null}
                      {notification.link ? (
                        <Link
                          href={notification.link}
                          className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                        >
                          Voir
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Pour changer de mot de passe, nous vous envoyons un lien sécurisé par email.
              </p>
              <Link
                href="/mot-de-passe-oublie"
                className="inline-block font-medium text-primary hover:underline"
              >
                Changer mon mot de passe
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
