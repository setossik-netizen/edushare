import type { Metadata } from "next";

import { PhasePlaceholder } from "@/components/phase-placeholder";

export const metadata: Metadata = { title: "Devenir modérateur" };

export default function ModerationPage() {
  return (
    <PhasePlaceholder
      phase="Communauté"
      title="Devenir modérateur"
      description="Les modérateurs bénévoles gardent le catalogue propre et utile : lisibilité, complétude, classification et doublons. Les candidatures ouvriront avec la file de modération de la phase 2."
      bullets={[
        "Objectif : une décision en moins de 48 heures.",
        "Un modérateur ne peut jamais modérer sa propre ressource.",
        "Chaque décision est journalisée : qui, quand, décision, motif.",
      ]}
      primaryAction={{ href: "/a-propos", label: "À propos du projet" }}
    />
  );
}
