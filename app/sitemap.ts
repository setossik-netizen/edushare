import type { MetadataRoute } from "next";

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes = [
    "",
    "/explorer",
    "/partager",
    "/connexion",
    "/inscription",
    "/mot-de-passe-oublie",
    "/a-propos",
    "/cgu",
    "/confidentialite",
    "/droit-auteur",
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  if (isSupabaseConfigured() && hasAdminClient()) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("resources")
        .select("id, updated_at")
        .eq("status", "APPROVED")
        .limit(200);
      for (const resource of data ?? []) {
        entries.push({
          url: `${base}/ressource/${resource.id}`,
          lastModified: new Date(resource.updated_at),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    } catch (error) {
      console.error("[sitemap]", error);
    }
  }

  return entries;
}
