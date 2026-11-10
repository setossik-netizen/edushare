import { NextResponse, type NextRequest } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { canDownload } from "@/lib/resources";
import { getResource } from "@/lib/resources";
import { createAdminClient, hasAdminClient, STORAGE_BUCKET } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isSupabaseConfigured() || !hasAdminClient()) {
    return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const resource = await getResource(id);
  if (!resource) {
    return NextResponse.json({ error: "Ressource introuvable." }, { status: 404 });
  }

  const isOwner = resource.author.id === user.id;
  const isStaff = user.role === "moderator" || user.role === "admin";

  if (resource.status !== "APPROVED" && !isOwner && !isStaff) {
    return NextResponse.json({ error: "Ressource introuvable." }, { status: 404 });
  }

  if (!canDownload(user) || resource.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Vous devez partager un document validé pour télécharger." },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  const { data: signed, error } = await admin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(resource.filePath, 60);

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: "Impossible de générer le lien." }, { status: 500 });
  }

  // Enregistrement du téléchargement (ignoré si doublon le même jour).
  try {
    const supabase = await createClient();
    const { error: insertError } = await supabase.from("downloads").insert({
      user_id: user.id,
      resource_id: resource.id,
    });

    if (!insertError) {
      await admin
        .from("resources")
        .update({ download_count: resource.downloadCount + 1 })
        .eq("id", resource.id);
    }
  } catch (error) {
    console.error("[download] record:", error);
  }

  return NextResponse.redirect(signed.signedUrl);
}
