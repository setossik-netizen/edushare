import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

const SECTIONS = [
  {
    title: "Objet",
    body: "EduShare met à disposition une bibliothèque collaborative de ressources scolaires. L'utilisation du service implique l'acceptation des présentes conditions.",
  },
  {
    title: "Compte",
    body: "L'inscription est gratuite et ouverte à toute personne disposant d'une adresse email. L'utilisateur est responsable de la confidentialité de ses identifiants. Un compte peut être supprimé à tout moment, avec anonymisation des ressources déjà publiées.",
  },
  {
    title: "Contributions",
    body: "Tout document partagé doit être lisible, complet, correctement classifié et légalement diffusable. Les manuels scolaires complets scannés, les contenus haineux, les données personnelles dans les PDF et les documents vides sont refusés. L'utilisateur garantit détenir les droits sur le document déposé.",
  },
  {
    title: "Usage",
    body: "La règle du donnant-donnant s'applique : l'accès à la lecture intégrale et au téléchargement est réservé aux utilisateurs ayant au moins une ressource approuvée. Il est interdit de contourner cette règle, de scraper le catalogue ou de redistribuer les fichiers en dehors du service.",
  },
  {
    title: "Responsabilité",
    body: "EduShare est fourni tel quel, sans garantie. La plateforme n'est pas responsable du contenu déposé par les utilisateurs et s'engage à retirer sous 24 heures tout contenu signalé comme illicite.",
  },
];

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Conditions générales d&apos;utilisation</h1>
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
