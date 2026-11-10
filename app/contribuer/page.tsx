import type { Metadata } from "next";

import { PhasePlaceholder } from "@/components/phase-placeholder";

export const metadata: Metadata = { title: "Contribuer au code" };

export default function ContributePage() {
  return (
    <PhasePlaceholder
      phase="Communauté"
      title="Contribuer au code"
      description="EduShare est un projet open source sous licence MIT. Le dépôt et les bonnes pratiques de contribution seront publiés au lancement du MVP."
      primaryAction={{ href: "/a-propos", label: "À propos du projet" }}
      secondaryAction={{ href: "/moderation", label: "Devenir modérateur" }}
    />
  );
}
