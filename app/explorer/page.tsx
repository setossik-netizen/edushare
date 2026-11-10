import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Library, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { listResources } from "@/lib/resources";
import { LEVELS, RESOURCE_TYPES, SUBJECTS } from "@/lib/taxonomy";
import { resourceTypeLabel } from "@/lib/resources";

export const metadata: Metadata = {
  title: "Explorer le catalogue",
  description: "Recherchez les cours, exercices et examens par classe, matière, type et année.",
};

type ExplorerSearchParams = {
  q?: string;
  classe?: string;
  matiere?: string;
  type?: string;
  annee?: string;
  tri?: string;
  page?: string;
};

export default function ExplorerPage({
  searchParams,
}: {
  searchParams: Promise<ExplorerSearchParams>;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <Badge variant="outline">Catalogue</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Explorer le catalogue
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Recherchez par titre, matière, classe, type et année. Les résultats sont triés par
        pertinence par défaut.
      </p>

      <Suspense fallback={<ExplorerSkeleton />}>
        <ExplorerContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ExplorerContent({
  searchParams,
}: {
  searchParams: Promise<ExplorerSearchParams>;
}) {
  await connection();
  const params = await searchParams;

  const page = Number(params.page ?? "1") || 1;
  const sort =
    params.tri === "populaires"
      ? "popular"
      : params.tri === "vues"
        ? "views"
        : "recent";

  const result = await listResources({
    q: params.q,
    level: params.classe,
    subject: params.matiere,
    type: params.type,
    year: params.annee ? Number(params.annee) : undefined,
    sort,
    page,
    pageSize: 24,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  function pageHref(nextPage: number) {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.classe) query.set("classe", params.classe);
    if (params.matiere) query.set("matiere", params.matiere);
    if (params.type) query.set("type", params.type);
    if (params.annee) query.set("annee", params.annee);
    if (params.tri) query.set("tri", params.tri);
    if (nextPage > 1) query.set("page", String(nextPage));
    const qs = query.toString();
    return qs ? `/explorer?${qs}` : "/explorer";
  }

  return (
    <>
      <form
        action="/explorer"
        method="get"
        className="mt-8 grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Rechercher un cours, une matière…"
            aria-label="Rechercher"
            className="pl-9"
          />
        </div>

        <NativeSelect name="classe" defaultValue={params.classe ?? ""} aria-label="Classe">
          <option value="">Toutes les classes</option>
          {LEVELS.map((level) => (
            <option key={level.slug} value={level.slug}>
              {level.label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect name="matiere" defaultValue={params.matiere ?? ""} aria-label="Matière">
          <option value="">Toutes les matières</option>
          {SUBJECTS.map((subject) => (
            <option key={subject.slug} value={subject.slug}>
              {subject.label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect name="type" defaultValue={params.type ?? ""} aria-label="Type">
          <option value="">Tous les types</option>
          {RESOURCE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </NativeSelect>

        <div className="flex gap-2">
          <NativeSelect name="tri" defaultValue={params.tri ?? ""} aria-label="Tri" className="flex-1">
            <option value="">Plus récents</option>
            <option value="populaires">Plus téléchargés</option>
            <option value="vues">Plus vus</option>
          </NativeSelect>
          <button type="submit" className={buttonVariants({ className: "shrink-0" })}>
            Filtrer
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{result.total} résultat{result.total > 1 ? "s" : ""}</span>
        {params.q ? <Badge variant="secondary">« {params.q} »</Badge> : null}
        {params.classe ? (
          <Badge variant="secondary">
            {LEVELS.find((l) => l.slug === params.classe)?.label ?? params.classe}
          </Badge>
        ) : null}
        {params.matiere ? (
          <Badge variant="secondary">
            {SUBJECTS.find((s) => s.slug === params.matiere)?.label ?? params.matiere}
          </Badge>
        ) : null}
        {params.type ? (
          <Badge variant="secondary">
            {RESOURCE_TYPES.find((t) => t.value === params.type)?.label ?? params.type}
          </Badge>
        ) : null}
      </div>

      {result.items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Library className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Aucune ressource trouvée</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Essayez d&apos;élargir vos filtres, ou partagez le document manquant pour lancer
            le fonds commun.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link href="/partager" className={buttonVariants()}>
              Partager un document
            </Link>
            <Link href="/explorer" className={buttonVariants({ variant: "outline" })}>
              Réinitialiser les filtres
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((resource) => (
            <Link
              key={resource.id}
              href={`/ressource/${resource.id}`}
              className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex items-start justify-between gap-2">
                <Badge variant="secondary" className="shrink-0">
                  {resourceTypeLabel(resource.type)}
                </Badge>
                <span className="text-xs text-muted-foreground">{resource.year}</span>
              </div>
              <h3 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary">
                {resource.title}
              </h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {resource.description}
              </p>
              <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="truncate">
                  {resource.subject.label} · {resource.level.label}
                </span>
                <span className="shrink-0">
                  {resource.downloadCount} ↓
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav
          className="mt-10 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={buttonVariants({ variant: "outline" })}>
              Précédent
            </Link>
          ) : null}
          <span className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className={buttonVariants({ variant: "outline" })}>
              Suivant
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}

function ExplorerSkeleton() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-44 animate-pulse rounded-xl border bg-muted/20"
        />
      ))}
    </div>
  );
}
