export const RESOURCE_TYPES = [
  { value: "COURS", label: "Cours" },
  { value: "EXERCICE", label: "Exercice" },
  { value: "DEVOIR", label: "Devoir surveillé" },
  { value: "EXAMEN", label: "Examen" },
  { value: "CORRIGE", label: "Corrigé" },
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number]["value"];

export const CYCLES = [
  { value: "primaire", label: "Primaire" },
  { value: "college", label: "Collège" },
  { value: "lycee", label: "Lycée" },
  { value: "universite", label: "Université" },
] as const;

export const LEVELS = [
  { slug: "ci", label: "CI", cycle: "primaire" },
  { slug: "cp", label: "CP", cycle: "primaire" },
  { slug: "ce1", label: "CE1", cycle: "primaire" },
  { slug: "ce2", label: "CE2", cycle: "primaire" },
  { slug: "cm1", label: "CM1", cycle: "primaire" },
  { slug: "cm2", label: "CM2", cycle: "primaire" },
  { slug: "6eme", label: "6e", cycle: "college" },
  { slug: "5eme", label: "5e", cycle: "college" },
  { slug: "4eme", label: "4e", cycle: "college" },
  { slug: "3eme", label: "3e", cycle: "college" },
  { slug: "2nde", label: "2nde", cycle: "lycee" },
  { slug: "1ere", label: "1ère", cycle: "lycee" },
  { slug: "terminale-a", label: "Terminale A", cycle: "lycee" },
  { slug: "terminale-c", label: "Terminale C", cycle: "lycee" },
  { slug: "terminale-d", label: "Terminale D", cycle: "lycee" },
  { slug: "licence-1", label: "Licence 1", cycle: "universite" },
  { slug: "licence-2", label: "Licence 2", cycle: "universite" },
  { slug: "licence-3", label: "Licence 3", cycle: "universite" },
] as const;

export const SUBJECTS = [
  { slug: "mathematiques", label: "Mathématiques" },
  { slug: "svt", label: "SVT" },
  { slug: "physique-chimie", label: "Physique-Chimie" },
  { slug: "francais", label: "Français" },
  { slug: "anglais", label: "Anglais" },
  { slug: "histoire-geographie", label: "Histoire-Géographie" },
  { slug: "philosophie", label: "Philosophie" },
  { slug: "economie", label: "Économie" },
  { slug: "informatique", label: "Informatique" },
] as const;

export const REJECTION_REASONS = [
  { value: "ILLISIBLE", label: "Document illisible" },
  { value: "DOUBLON", label: "Doublon" },
  { value: "MAUVAISE_CLASSIFICATION", label: "Mauvaise classification" },
  { value: "INCOMPLET", label: "Document incomplet" },
  { value: "INAPPROPRIE", label: "Contenu inapproprié" },
  { value: "DROIT_AUTEUR", label: "Droit d'auteur suspect" },
] as const;

/** Business limits from the spec (section 3.3 / 3.4). */
export const LIMITS = {
  maxFileSizeMb: 20,
  maxPages: 150,
  maxPendingUploads: 5,
  uploadCooldownMinutes: 10,
  previewPages: 3,
  pageSize: 24,
  signedUrlTtlSeconds: 60,
} as const;
