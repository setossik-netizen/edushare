import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { LevelOption, SessionUser, UserRole } from "@/lib/auth-types";

const PROFILE_COLUMNS =
  "username, role, approved_count, is_contributor, avatar_url, current_level_id, bio";

/**
 * Current user with the profile fields needed by the UI.
 * Cached per request so the header and the page share one auth call.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    username: profile?.username ?? user.email?.split("@")[0] ?? "membre",
    role: (profile?.role as UserRole | undefined) ?? "user",
    approvedCount: profile?.approved_count ?? 0,
    isContributor: profile?.is_contributor ?? false,
    avatarUrl: profile?.avatar_url ?? null,
    currentLevelId: profile?.current_level_id ?? null,
    bio: profile?.bio ?? null,
  };
});

export const getLevels = cache(async (): Promise<LevelOption[]> => {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("levels")
    .select("id, slug, label, cycle")
    .order("order_index", { ascending: true });

  return (data as LevelOption[] | null) ?? [];
});

/** Redirects visitors to the login page, then returns the authenticated user. */
export async function requireUser(nextPath = "/profil"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/connexion?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

/** Moderators and admins only. */
export async function requireStaff(nextPath = "/admin"): Promise<SessionUser> {
  const user = await requireUser(nextPath);
  if (user.role === "user") {
    redirect("/profil");
  }
  return user;
}
