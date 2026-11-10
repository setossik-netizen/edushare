"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "@/lib/actions/auth";
import type { AuthActionState } from "@/lib/auth-types";

const initialState: AuthActionState = { status: "idle" };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status !== "idle" && state.message ? (
        <FormAlert tone={state.status === "error" ? "error" : "success"}>
          {state.message}
        </FormAlert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Adresse email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="vous@exemple.com"
          required
        />
      </div>

      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? "Envoi…" : "Recevoir un lien de réinitialisation"}
      </Button>
    </form>
  );
}
