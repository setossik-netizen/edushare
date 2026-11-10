import type { Metadata } from "next";

export const metadata: Metadata = { title: "Confidentialité" };

const SECTIONS = [
  {
    title: "Données collectées",
    body: "Adresse email, pseudo, classe actuelle (optionnelle), bio courte, et les métadonnées des documents partagés. Aucune donnée sensible, aucune géolocalisation, aucune messagerie privée.",
  },
  {
    title: "Finalité",
    body: "Fournir le service de bibliothèque collaborative, gérer les comptes, modérer les contenus et prévenir les abus.",
  },
  {
    title: "Conservation",
    body: "Les données sont conservées tant que le compte existe. À la suppression du compte, les ressources publiées sont anonymisées (l'auteur devient « Compte supprimé »).",
  },
  {
    title: "Droits",
    body: "Conformité RGPD : droit d'accès, de rectification, d'export et de suppression. Pas de revente de données, aucune publicité. Hébergement dans l'Union européenne lorsque c'est possible.",
  },
  {
    title: "Mineurs",
    body: "Le service est accessible aux mineurs. Aucune donnée sensible n'est demandée et aucune messagerie privée n'est disponible dans le MVP.",
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Politique de confidentialité</h1>
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
