"use server";

import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import type { AuthActionState } from "@/lib/auth-types";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const NOT_CONFIGURED: AuthActionState = {
  status: "error",
  message: "Supabase n'est pas configuré. Renseignez les variables d'environnement.",
};

const resourceSchema = z.object({
  title: z.string().trim().min(10, "Le titre doit contenir au moins 10 caractères.").max(120),
  description: z.string().trim().min(30, "La description doit contenir au moins 30 caractères.").max(2000),
  levelId: z.string().uuid("Classe invalide."),
  subjectId: z.string().uuid("Matière invalide."),
  type: z.enum(["COURS", "EXERCICE", "DEVOIR", "EXAMEN", "CORRIGE"]),
  year: z.coerce.number().int().min(1990).max(2100),
  school: z.string().trim().max(120).optional(),
  language: z.string().trim().max(8).default("fr"),
  googleDriveUrl: z
    .string()
    .trim()
    .url("Lien Google Drive invalide.")
    .refine(
      (url) => /drive\.google\.com|docs\.google\.com/.test(url),
      "Le lien doit provenir de Google Drive ou Google Docs.",
    ),
});

function logError(context: string, message: string) {
  console.error(`[resources] ${context}: ${message}`);
}

const COOLDOWN_MS = 10 * 60 * 1000;
const MAX_PENDING = 5;

export async function createResourceAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const user = await getSessionUser();
  if (!user) {
    return { status: "error", message: "Votre session a expiré. Reconnectez-vous." };
  }

  const parsed = resourceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();

  // Anti-abus : nombre d'uploads en attente.
  const { count: pendingCount } = await supabase
    .from("resources")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id)
    .eq("status", "PENDING");

  if ((pendingCount ?? 0) >= MAX_PENDING) {
    return {
      status: "error",
      message: "Vous avez déjà 5 documents en attente de modération.",
    };
  }

  // Anti-abus : cooldown.
  const { data: lastUpload } = await supabase
    .from("resources")
    .select("created_at")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastUpload?.created_at) {
    const elapsed = Date.now() - new Date(lastUpload.created_at).getTime();
    if (elapsed < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - elapsed) / 60000);
      return {
        status: "error",
        message: `Veuillez attendre ${remaining} minute(s) avant de partager un nouveau document.`,
      };
    }
  }

  const { error: insertError } = await supabase.from("resources").insert({
    author_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    level_id: parsed.data.levelId,
    subject_id: parsed.data.subjectId,
    type: parsed.data.type,
    year: parsed.data.year,
    school: parsed.data.school || null,
    language: parsed.data.language,
    google_drive_url: parsed.data.googleDriveUrl,
    status: "PENDING",
  });

  if (insertError) {
    logError("resource-insert", insertError.message);
    return {
      status: "error",
      message:
        insertError.code === "23505"
          ? "Ce document existe déjà."
          : "Impossible d'enregistrer la ressource. Réessayez.",
    };
  }

  redirect("/mes-contributions");
}

export async function moderateResourceAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const user = await getSessionUser();
  if (!user || (user.role !== "moderator" && user.role !== "admin")) return;

  const resourceId = String(formData.get("resourceId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || null;

  if (!resourceId || (decision !== "APPROVE" && decision !== "REJECT")) return;
  if (decision === "REJECT" && !reason) return;

  const supabase = await createClient();

  const { data: resource } = await supabase
    .from("resources")
    .select("id, author_id, google_drive_url, status")
    .eq("id", resourceId)
    .maybeSingle();

  if (!resource || resource.status !== "PENDING") return;

  // Un modérateur ne peut pas modérer sa propre ressource.
  if (resource.author_id === user.id) {
    logError("moderate", "Self-moderation attempted");
    return;
  }

  const newStatus = decision === "APPROVE" ? "APPROVED" : "REJECTED";
  const rejectionReason = decision === "REJECT" ? reason : null;

  const { error } = await supabase
    .from("resources")
    .update({
      status: newStatus,
      rejection_reason: rejectionReason,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", resourceId);

  if (error) {
    logError("moderate", error.message);
    return;
  }

  await supabase.from("moderation_logs").insert({
    resource_id: resourceId,
    moderator_id: user.id,
    action: decision === "APPROVE" ? "APPROVE" : "REJECT",
    reason: rejectionReason,
  });

  // Notification à l'auteur.
  if (resource.author_id) {
    const title =
      decision === "APPROVE"
        ? "Votre document a été approuvé"
        : "Votre document a été rejeté";
    const body =
      decision === "APPROVE"
        ? "Il est maintenant visible par toute la communauté et votre compte est débloqué."
        : `Motif : ${reason}. Vous pouvez corriger et renvoyer une nouvelle version.`;

    await supabase.from("notifications").insert({
      user_id: resource.author_id,
      type: decision === "APPROVE" ? "RESOURCE_APPROVED" : "RESOURCE_REJECTED",
      title,
      body,
      link: `/ressource/${resourceId}`,
    });

    // Email best-effort.
    if (hasAdminClient()) {
      try {
        const admin = createAdminClient();
        const { data: author } = await admin.auth.admin.getUserById(resource.author_id);
        const email = author?.user?.email;
        if (email) {
          const { sendEmail } = await import("@/lib/email");
          await sendEmail({
            to: email,
            subject: title,
            html: `<p>Bonjour,</p><p>${body}</p><p><a href="${getSiteUrl()}/ressource/${resourceId}">Voir le document</a></p>`,
          });
        }
      } catch (error) {
        logError("notify", String(error));
      }
    }
  }
}

export async function toggleFavoriteAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const user = await getSessionUser();
  if (!user) return;

  const resourceId = String(formData.get("resourceId") ?? "");
  if (!resourceId) return;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("favorites")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("resource_id", resourceId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("resource_id", resourceId);
  } else {
    await supabase.from("favorites").insert({ user_id: user.id, resource_id: resourceId });
  }
}

export async function reportResourceAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Connectez-vous pour signaler." };

  const resourceId = String(formData.get("resourceId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();

  if (!resourceId || !reason) {
    return { status: "error", message: "Choisissez un motif de signalement." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    resource_id: resourceId,
    reason,
    comment: comment || null,
  });

  if (error) {
    logError("report", error.message);
    return { status: "error", message: "Impossible d'envoyer le signalement." };
  }

  return { status: "success", message: "Signalement envoyé. Merci." };
}

export async function resolveReportAction(formData: FormData): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const user = await getSessionUser();
  if (!user || (user.role !== "moderator" && user.role !== "admin")) return;

  const reportId = String(formData.get("reportId") ?? "");
  if (!reportId) return;

  const supabase = await createClient();
  await supabase.from("reports").update({ status: "RESOLVED" }).eq("id", reportId);
}

export async function markNotificationsReadAction(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const user = await getSessionUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
}
