"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { refresh, revalidatePath } from "next/cache";
import { PDFDocument } from "pdf-lib";

import { getSessionUser } from "@/lib/auth";
import type { AuthActionState } from "@/lib/auth-types";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient, hasAdminClient, resourcePath, STORAGE_BUCKET } from "@/lib/supabase/admin";
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
});

function logError(context: string, message: string) {
  console.error(`[resources] ${context}: ${message}`);
}

const COOLDOWN_MS = 10 * 60 * 1000;
const MAX_PENDING = 5;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

export async function createResourceAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const user = await getSessionUser();
  if (!user) {
    return { status: "error", message: "Votre session a expiré. Reconnectez-vous." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Sélectionnez un fichier PDF." };
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { status: "error", message: "Le fichier doit être au format PDF." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { status: "error", message: "Le fichier dépasse la taille maximale de 20 Mo." };
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

  const bytes = new Uint8Array(await file.arrayBuffer());
  const hash = createHash("sha256").update(bytes).digest("hex");

  // Doublon exact.
  const { data: duplicate } = await supabase
    .from("resources")
    .select("id, title")
    .eq("file_hash", hash)
    .maybeSingle();

  if (duplicate) {
    return {
      status: "error",
      message: `Ce document existe déjà : « ${duplicate.title} ».`,
    };
  }

  // Nombre de pages.
  let pageCount = 0;
  try {
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    pageCount = pdf.getPageCount();
  } catch (error) {
    logError("pdf-parse", String(error));
    return { status: "error", message: "Le fichier PDF est illisible ou corrompu." };
  }

  if (pageCount < 1 || pageCount > 150) {
    return { status: "error", message: "Le document doit contenir entre 1 et 150 pages." };
  }

  const resourceId = crypto.randomUUID();
  const path = resourcePath(user.id, resourceId);

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, bytes, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    logError("storage-upload", uploadError.message);
    return { status: "error", message: "L'envoi du fichier a échoué. Réessayez." };
  }

  const { error: insertError } = await supabase.from("resources").insert({
    id: resourceId,
    author_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    level_id: parsed.data.levelId,
    subject_id: parsed.data.subjectId,
    type: parsed.data.type,
    year: parsed.data.year,
    school: parsed.data.school || null,
    language: parsed.data.language,
    file_path: path,
    file_size: file.size,
    page_count: pageCount,
    file_hash: hash,
    status: "PENDING",
  });

  if (insertError) {
    logError("resource-insert", insertError.message);
    // Nettoyage du fichier orphelin.
    await supabase.storage.from(STORAGE_BUCKET).remove([path]).catch(() => undefined);
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
    .select("id, author_id, file_path, status")
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

  // Suppression du fichier rejeté (immédiate pour économiser le stockage).
  if (decision === "REJECT" && resource.file_path) {
    try {
      const admin = createAdminClient();
      await admin.storage.from(STORAGE_BUCKET).remove([resource.file_path]);
    } catch (error) {
      logError("storage-delete", String(error));
    }
  }

  revalidatePath("/admin");
  revalidatePath("/mes-contributions");
  revalidatePath("/explorer");
  refresh();
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
