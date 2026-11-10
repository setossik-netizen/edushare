import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { SessionUser } from "@/lib/auth-types";

export type ResourceStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ResourceTypeValue = "COURS" | "EXERCICE" | "DEVOIR" | "EXAMEN" | "CORRIGE";

export type ResourceAuthor = {
  id: string | null;
  username: string;
  avatarUrl: string | null;
};

export type ResourceListItem = {
  id: string;
  title: string;
  description: string;
  type: ResourceTypeValue;
  year: number;
  school: string | null;
  language: string;
  googleDriveUrl: string;
  downloadCount: number;
  viewCount: number;
  status: ResourceStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  author: ResourceAuthor;
  level: { slug: string; label: string };
  subject: { slug: string; label: string };
};

export type ResourceDetail = ResourceListItem & {
  moderatedBy: string | null;
  moderatedAt: string | null;
};

type RawResource = {
  id: string;
  title: string;
  description: string;
  type: ResourceTypeValue;
  year: number;
  school: string | null;
  language: string;
  google_drive_url: string;
  download_count: number;
  view_count: number;
  status: ResourceStatus;
  rejection_reason: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
  levels: { slug: string; label: string } | null;
  subjects: { slug: string; label: string } | null;
  profiles: { username: string; avatar_url: string | null } | null;
};

function mapResource(raw: RawResource): ResourceListItem {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    type: raw.type,
    year: raw.year,
    school: raw.school,
    language: raw.language,
    googleDriveUrl: raw.google_drive_url,
    downloadCount: raw.download_count,
    viewCount: raw.view_count,
    status: raw.status,
    rejectionReason: raw.rejection_reason,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    author: {
      id: raw.author_id,
      username: raw.profiles?.username ?? "Compte supprimé",
      avatarUrl: raw.profiles?.avatar_url ?? null,
    },
    level: raw.levels ?? { slug: "", label: "—" },
    subject: raw.subjects ?? { slug: "", label: "—" },
  };
}

function mapDetail(raw: RawResource): ResourceDetail {
  return {
    ...mapResource(raw),
    moderatedBy: raw.moderated_by,
    moderatedAt: raw.moderated_at,
  };
}

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

export type ResourceFilters = {
  q?: string;
  level?: string;
  subject?: string;
  type?: string;
  year?: number;
  sort?: "recent" | "popular" | "views";
  page?: number;
  pageSize?: number;
  status?: ResourceStatus;
  authorId?: string;
};

export async function listResources(filters: ResourceFilters = {}) {
  if (!isSupabaseConfigured()) {
    return { items: [], total: 0, page: filters.page ?? 1, pageSize: filters.pageSize ?? 24 };
  }
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? 24));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("resources")
    .select(
      "id,title,description,type,year,school,language,google_drive_url,download_count,view_count,status,rejection_reason,moderated_by,moderated_at,created_at,updated_at,author_id,levels(slug,label),subjects(slug,label),profiles:author_id(username,avatar_url)",
      { count: "exact" },
    );

  if (filters.status) {
    query = query.eq("status", filters.status);
  } else if (!filters.authorId) {
    query = query.eq("status", "APPROVED");
  }

  if (filters.level) query = query.eq("levels.slug", filters.level);
  if (filters.subject) query = query.eq("subjects.slug", filters.subject);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.year) query = query.eq("year", filters.year);
  if (filters.authorId) query = query.eq("author_id", filters.authorId);

  if (filters.q?.trim()) {
    const term = escapeIlike(filters.q.trim());
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }

  switch (filters.sort) {
    case "popular":
      query = query.order("download_count", { ascending: false });
      break;
    case "views":
      query = query.order("view_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    items: ((data ?? []) as unknown as RawResource[]).map(mapResource),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getResource(id: string): Promise<ResourceDetail | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select(
      "id,title,description,type,year,school,language,google_drive_url,download_count,view_count,status,rejection_reason,moderated_by,moderated_at,created_at,updated_at,author_id,levels(slug,label),subjects(slug,label),profiles:author_id(username,avatar_url)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapDetail(data as unknown as RawResource);
}

export async function getUserResources(userId: string) {
  return listResources({ authorId: userId, status: undefined, pageSize: 48 });
}

export async function getPendingResources() {
  return listResources({ status: "PENDING", pageSize: 48, sort: "recent" });
}

export async function getFavoriteIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("resource_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((row: { resource_id: string }) => row.resource_id));
}

export async function getFavorites(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("resource_id, created_at, resources(id,title,description,type,year,school,language,google_drive_url,download_count,view_count,status,rejection_reason,moderated_by,moderated_at,created_at,updated_at,author_id,levels(slug,label),subjects(slug,label),profiles:author_id(username,avatar_url))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return ((data ?? []) as unknown as Array<{ resources: RawResource | null }>)
    .map((row) => (row.resources ? mapResource(row.resources) : null))
    .filter((item): item is ResourceListItem => item !== null);
}

export async function getNotifications(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id,type,title,body,link,read_at,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  return count ?? 0;
}

export async function markNotificationsRead(userId: string) {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
}

export async function getCatalogStats() {
  if (!isSupabaseConfigured()) {
    return { resources: 0, contributors: 0, downloads: 0 };
  }
  const supabase = await createClient();
  const [resources, contributors, downloads] = await Promise.all([
    supabase.from("resources").select("id", { count: "exact", head: true }).eq("status", "APPROVED"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("approved_count", 1),
    supabase.from("downloads").select("id", { count: "exact", head: true }),
  ]);
  return {
    resources: resources.count ?? 0,
    contributors: contributors.count ?? 0,
    downloads: downloads.count ?? 0,
  };
}

export async function getReports() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("id,reason,comment,status,created_at,resource_id,reporter_id,resources(title),profiles:reporter_id(username)")
    .eq("status", "OPEN")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function incrementViewCount(resourceId: string): Promise<void> {
  if (!hasAdminClient()) return;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("resources")
      .select("view_count")
      .eq("id", resourceId)
      .maybeSingle();
    if (data) {
      await admin
        .from("resources")
        .update({ view_count: (data.view_count ?? 0) + 1 })
        .eq("id", resourceId);
    }
  } catch (error) {
    console.error("[resources] incrementView:", error);
  }
}


export function canDownload(user: SessionUser | null): boolean {
  return Boolean(user && (user.isContributor || user.role === "moderator" || user.role === "admin"));
}

export async function getSubjects() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("id, slug, label")
    .order("order_index", { ascending: true });
  return (data as Array<{ id: string; slug: string; label: string }> | null) ?? [];
}
export function resourceTypeLabel(type: ResourceTypeValue): string {
  switch (type) {
    case "COURS":
      return "Cours";
    case "EXERCICE":
      return "Exercice";
    case "DEVOIR":
      return "Devoir surveillé";
    case "EXAMEN":
      return "Examen";
    case "CORRIGE":
      return "Corrigé";
  }
}
