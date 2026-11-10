import Link from "next/link";
import { GraduationCap } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Plateforme",
    links: [
      { href: "/explorer", label: "Explorer le catalogue" },
      { href: "/partager", label: "Partager un document" },
      { href: "/#comment-ca-marche", label: "Comment ça marche" },
    ],
  },
  {
    title: "Communauté",
    links: [
      { href: "/a-propos", label: "À propos" },
      { href: "/contribuer", label: "Contribuer au code" },
      { href: "/moderation", label: "Devenir modérateur" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/cgu", label: "Conditions d'utilisation" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/droit-auteur", label: "Droit d'auteur" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2" aria-label="EduShare, accueil">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="size-4" aria-hidden="true" />
              </span>
              <span className="font-semibold tracking-tight">EduShare</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              La bibliothèque scolaire collaborative du monde francophone. Gratuite,
              open source, et alimentée par celles et ceux qui l&apos;utilisent.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Licence MIT · Données hébergées dans l&apos;Union européenne
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold">{group.title}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 EduShare. Projet open source sous licence MIT.</p>
          <p>Fait pour le Bénin et l&apos;Afrique de l&apos;Ouest, ouvert à toute la francophonie.</p>
        </div>
      </div>
    </footer>
  );
}
