import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ user: null });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
      isContributor: user.isContributor,
    },
  });
}
