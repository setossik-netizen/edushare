import { z } from "zod";

export const usernameField = z
  .string()
  .trim()
  .min(3, "Le pseudo doit contenir au moins 3 caractères.")
  .max(20, "Le pseudo ne doit pas dépasser 20 caractères.")
  .regex(/^\S+$/, "Le pseudo ne doit pas contenir d'espace.");

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Adresse email invalide."));

export const passwordField = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(72, "Le mot de passe ne doit pas dépasser 72 caractères.");

const optionalLevelId = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.uuid("Classe invalide.").optional(),
);

export const signUpSchema = z.object({
  username: usernameField,
  email: emailField,
  password: passwordField,
  levelId: optionalLevelId,
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Saisissez votre mot de passe."),
  next: z.string().optional(),
});

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  username: usernameField,
  levelId: optionalLevelId,
  bio: z
    .string()
    .trim()
    .max(280, "La bio ne doit pas dépasser 280 caractères.")
    .optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
