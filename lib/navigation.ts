/** Rejette les redirections ouvertes : seuls les chemins internes sont acceptés. */
export function safeNextPath(value: unknown, fallback = "/profil"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}
