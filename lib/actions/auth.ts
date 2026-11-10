"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import type { AuthActionState } from "@/lib/auth-types";
import { safeNextPath } from "@/lib/navigation";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  profileSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/lib/validation/auth";

const NOT_CONFIGURED: AuthActionState = {
  status: "error",
  message:
    "Supabase n'est pas configuré. Renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local.",
};

function authErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirmez votre adresse email avant de vous connecter.";
  }
  if (normalized.includes("user already registered")) {
    return "Un compte existe déjà avec cette adresse email.";
  }
  if (normalized.includes("password should be at least")) {
    return "Le mot de passe est trop court.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  }
  return "Une erreur est survenue. Réessayez dans un instant.";
}

function logAuthError(context: string, message: string) {
  console.error(`[auth] ${context}: ${message}`);
}

export async function signUpAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const { username, email, password, levelId } = parsed.data;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle();

  if (existing) {
    return { status: "error", message: "Ce pseudo est déjà utilisé. Choisissez-en un autre." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        current_level_id: levelId ?? null,
      },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/profil")}`,
    },
  });

  if (error) {
    logAuthError("signUp", error.message);
    return { status: "error", message: authErrorMessage(error.message) };
  }

  if (data.session) {
    redirect("/profil");
  }

  return {
    status: "success",
    message:
      "Compte créé. Vérifiez votre boîte email : un lien de confirmation vient de vous être envoyé.",
  };
}

export async function loginAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    logAuthError("signIn", error.message);
    return { status: "error", message: authErrorMessage(error.message) };
  }

  redirect(safeNextPath(parsed.data.next));
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function forgotPasswordAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/reinitialiser-mot-de-passe")}`,
  });

  if (error) {
    logAuthError("resetPasswordForEmail", error.message);
  }

  // Même réponse dans tous les cas : pas d'énumération des comptes.
  return {
    status: "success",
    message:
      "Si un compte existe avec cette adresse, un email de réinitialisation vient d'être envoyé.",
  };
}

export async function updatePasswordAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    logAuthError("updateUser(password)", error.message);
    return {
      status: "error",
      message:
        error.message.toLowerCase().includes("session")
          ? "Votre lien a expiré. Demandez un nouveau lien de réinitialisation."
          : authErrorMessage(error.message),
    };
  }

  redirect("/profil?mot-de-passe=mis-a-jour");
}

export async function updateProfileAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const user = await getSessionUser();
  if (!user) {
    return { status: "error", message: "Votre session a expiré. Reconnectez-vous." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", parsed.data.username)
    .neq("id", user.id)
    .maybeSingle();

  if (existing) {
    return { status: "error", message: "Ce pseudo est déjà utilisé. Choisissez-en un autre." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      bio: parsed.data.bio ? parsed.data.bio : null,
      current_level_id: parsed.data.levelId ?? null,
    })
    .eq("id", user.id);

  if (error) {
    logAuthError("updateProfile", error.message);
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "Ce pseudo est déjà utilisé. Choisissez-en un autre."
          : "Impossible d'enregistrer le profil. Réessayez.",
    };
  }

  refresh();
  return { status: "success", message: "Profil mis à jour." };
}
