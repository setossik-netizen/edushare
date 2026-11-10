import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

import { getSiteUrl } from "@/lib/supabase/config";

/**
 * Service-role client. Server only: never import this from a Client Component.
 * Used for operations that must bypass RLS (signed URLs, cleanup).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client is not configured: set SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createSupabaseJsClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function hasAdminClient(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const STORAGE_BUCKET = "resources";

export function resourcePath(ownerId: string, resourceId: string): string {
  return `${ownerId}/${resourceId}.pdf`;
}

export { getSiteUrl };
