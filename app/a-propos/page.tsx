import type { Metadata } from "next";

export const metadata: Metadata = { title: "À propos" };

const SECTIONS = [
  {
    title: "Le projet",
    body: "EduShare est une bibliothèque scolaire collaborative, gratuite et open source, pensée pour le système éducatif francophone et prioritairement pour le Bénin et l'Afrique de l'Ouest. Elle rassemble les cours, exercices, devoirs surveillés et examens qui circulent aujourd'hui sur WhatsApp, en photocopies ou dans des groupes informels.",
  },
  {
    title: "Le principe",
    body: "Une ressource = une classe + une matière + un type + une année. Le principe du donnant-donnant garantit l'équité : on ne consomme que si l'on contribue. Un document partagé et validé par un modérateur ouvre l'accès à la lecture intégrale et au téléchargement de toute la bibliothèque.",
  },
  {
    title: "Les valeurs",
    body: "Gratuit pour toujours, sans publicité ni fonctionnalité payante. Open source sous licence MIT : code, taxonomie et documentation publics. Qualité avant quantité : chaque document est vérifié par un humain. Sobriété technique : une architecture qui tient dans les offres gratuites.",
  },
  {
    title: "Contribuer",
    body: "Le projet accueille les contributions de code, de taxonomie, de documentation et de modération. Consultez CONTRIBUTING.md dans le dépôt pour les conventions et la procédure.",
  },
];

export default function AboutPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">À propos d&apos;EduShare</h1>
      <p className="mt-3 text-muted-foreground">
        La bibliothèque scolaire collaborative du monde francophone.
      </p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
