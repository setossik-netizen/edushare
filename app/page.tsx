import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  FileUp,
  Library,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCatalogStats } from "@/lib/resources";
import { SUBJECTS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: UserPlus,
    title: "Créez un compte gratuit",
    description:
      "Une adresse email suffit. Aucune carte bancaire, aucune publicité, aucune donnée sensible demandée.",
  },
  {
    icon: FileUp,
    title: "Partagez un document",
    description:
      "Un PDF lisible, correctement classé par classe, matière, type et année. Il est vérifié par un modérateur.",
  },
  {
    icon: BookOpenCheck,
    title: "Débloquez la bibliothèque",
    description:
      "Dès qu'un de vos documents est approuvé, vous lisez et téléchargez librement toutes les ressources.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.95_0.04_163)_0%,transparent_70%)] dark:bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.3_0.05_163)_0%,transparent_70%)]"
        />
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="gap-1.5 py-1">
              <Sparkles className="size-3" aria-hidden="true" />
              100 % gratuit · open source · sans publicité
            </Badge>

            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Tous les cours, exercices et examens,{" "}
              <span className="text-primary">au même endroit.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              EduShare rassemble les ressources scolaires de la francophonie, classées par
              classe, matière, type et année. Un document partagé et validé vous ouvre
              l&apos;accès à toute la bibliothèque.
            </p>

            <form
              action="/explorer"
              method="get"
              className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  name="q"
                  type="search"
                  placeholder="Rechercher un cours, une matière, un examen…"
                  aria-label="Rechercher une ressource"
                  className="h-11 bg-background pl-9"
                />
              </div>
              <button type="submit" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
                Rechercher
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Populaire :</span>
              {[
                { label: "Terminale D", href: "/explorer?classe=terminale-d" },
                { label: "Mathématiques", href: "/explorer?matiere=mathematiques" },
                { label: "Examens", href: "/explorer?type=EXAMEN" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border bg-background px-3 py-1 text-xs font-medium transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section aria-label="Chiffres clés" className="border-b bg-muted/30">
        <Suspense fallback={<StatsFallback />}>
          <StatsSection />
        </Suspense>
      </section>

      {/* How it works */}
      <section id="comment-ca-marche" className="scroll-mt-20 py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Comment ça marche ?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Le principe est simple et équitable : on ne consomme que si on contribue.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <step.icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="text-3xl font-semibold text-muted-foreground/30">
                        {index + 1}
                      </span>
                    </div>
                    <CardTitle className="mt-4 text-lg">{step.title}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Subjects */}
      <section className="border-y bg-muted/30 py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Explorer par matière</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Du primaire à l&apos;université, sur le programme francophone.
              </p>
            </div>
            <Link
              href="/explorer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Tout le catalogue
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {SUBJECTS.map((subject) => (
              <Link
                key={subject.slug}
                href={`/explorer?matiere=${subject.slug}`}
                className="rounded-lg border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {subject.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent resources + rule */}
      <section className="py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Ressources récentes</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Les derniers documents approuvés par la communauté.
              </p>
            </div>
            <Link
              href="/explorer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Voir tout
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center lg:col-span-2">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Library className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">La bibliothèque attend son premier document</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Aucune ressource n&apos;a encore été approuvée. Soyez la première personne à
                partager un cours, un exercice ou une annale pour lancer le fonds commun.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link href="/partager" className={buttonVariants()}>
                  <FileUp aria-hidden="true" />
                  Partager un document
                </Link>
                <Link href="/explorer" className={buttonVariants({ variant: "outline" })}>
                  Parcourir le catalogue
                </Link>
              </div>
            </div>

            <Card className="h-full bg-primary/5 ring-primary/15">
              <CardHeader>
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <CardTitle className="mt-4 text-lg">La règle du donnant-donnant</CardTitle>
                <CardDescription className="leading-relaxed">
                  Un document approuvé suffit pour débloquer la lecture intégrale et le
                  téléchargement de toutes les ressources.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {[
                    "Aperçu de 3 pages pour tout le monde",
                    "Lecture et téléchargement réservés aux contributeurs validés",
                    "Modération humaine sous 48 h",
                    "Aucun fichier public : liens signés temporaires",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Prêt à ouvrir la bibliothèque ?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-primary-foreground/80">
              Créez votre compte en deux minutes, partagez un document de qualité, et accédez
              à tout ce que la communauté a construit.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/inscription"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "h-11 px-6",
                )}
              >
                Créer un compte gratuit
              </Link>
              <Link
                href="/explorer"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "h-11 px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
                )}
              >
                Explorer sans compte
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function StatsFallback() {
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded bg-muted/40" />
      ))}
    </div>
  );
}

async function StatsSection() {
  const stats = await getCatalogStats();
  const items = [
    { label: "Ressources approuvées", value: String(stats.resources) },
    { label: "Contributeurs validés", value: String(stats.contributors) },
    { label: "Téléchargements", value: String(stats.downloads) },
    { label: "Frais d'accès", value: "0 €" },
  ];
  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
      {items.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{stat.value}</p>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
