"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasswordAction } from "@/lib/actions/auth";
import type { AuthActionState } from "@/lib/auth-types";

const initialState: AuthActionState = { status: "idle" };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message ? (
        <FormAlert>{state.message}</FormAlert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
        />
        <p className="text-xs text-muted-foreground">8 caractères minimum.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
        />
      </div>

      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer le nouveau mot de passe"}
      </Button>
    </form>
  );
}
