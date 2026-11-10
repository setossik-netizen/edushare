import type { Metadata } from "next";

export const metadata: Metadata = { title: "Droit d'auteur" };

const SECTIONS = [
  {
    title: "Engagement des contributeurs",
    body: "Chaque utilisateur garantit détenir les droits nécessaires sur le document qu'il dépose et accepte que son pseudo soit associé à la ressource.",
  },
  {
    title: "Contenus refusés",
    body: "Les manuels scolaires complets scannés, les contenus protégés reproduits sans autorisation et les données personnelles (noms, téléphones) sont refusés.",
  },
  {
    title: "Signalement",
    body: "Un bouton « Signaler » est présent sur chaque fiche. Tout ayant droit peut signaler un contenu ; il est examiné par un modérateur et retiré sous 24 heures si nécessaire.",
  },
  {
    title: "Retrait",
    body: "Pour toute demande de retrait, utilisez le signalement ou contactez l'équipe du projet. Les signalements ne sont visibles que par les modérateurs.",
  },
];

export default function CopyrightPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Droit d&apos;auteur</h1>
      <div className="mt-8 space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
