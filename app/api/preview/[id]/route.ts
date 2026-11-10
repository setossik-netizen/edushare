import { NextResponse, type NextRequest } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { getResource } from "@/lib/resources";
import { createAdminClient, hasAdminClient, STORAGE_BUCKET } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isSupabaseConfigured() || !hasAdminClient()) {
    return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  }

  const resource = await getResource(id);
  if (!resource) {
    return NextResponse.json({ error: "Ressource introuvable." }, { status: 404 });
  }

  const user = await getSessionUser();
  const isOwner = resource.author.id === user?.id;
  const isStaff = user?.role === "moderator" || user?.role === "admin";

  const allowed =
    resource.status === "APPROVED" || (user && (isOwner || isStaff));

  if (!allowed) {
    return NextResponse.json({ error: "Ressource introuvable." }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: signed, error } = await admin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(resource.filePath, 120);

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: "Impossible de générer l'aperçu." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
