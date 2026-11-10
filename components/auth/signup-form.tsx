"use client";

import { useActionState } from "react";
import Link from "next/link";

import { FormAlert } from "@/components/auth/form-alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { signUpAction } from "@/lib/actions/auth";
import type { AuthActionState, LevelOption } from "@/lib/auth-types";
import { CYCLES } from "@/lib/taxonomy";

const initialState: AuthActionState = { status: "idle" };

export function SignUpForm({ levels }: { levels: LevelOption[] }) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  if (state.status === "success") {
    return (
      <div className="space-y-4">
        <FormAlert tone="success">{state.message}</FormAlert>
        <p className="text-sm text-muted-foreground">
          Vous pourrez vous connecter dès que votre adresse sera confirmée. Pensez à vérifier
          vos courriers indésirables.
        </p>
        <Link href="/connexion" className={buttonVariants({ variant: "outline" })}>
          Aller à la connexion
        </Link>
      </div>
    );
  }

  const groupedLevels = CYCLES.map((cycle) => ({
    ...cycle,
    levels: levels.filter((level) => level.cycle === cycle.value),
  })).filter((group) => group.levels.length > 0);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message ? (
        <FormAlert>{state.message}</FormAlert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="username">Pseudo</Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="amina24"
          minLength={3}
          maxLength={20}
          required
        />
        <p className="text-xs text-muted-foreground">
          3 à 20 caractères, sans espace. Il sera visible sur vos documents.
        </p>
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
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
        <Label htmlFor="levelId">Classe actuelle (optionnel)</Label>
        <NativeSelect id="levelId" name="levelId" defaultValue="">
          <option value="">Pas encore précisé</option>
          {groupedLevels.map((group) => (
            <optgroup key={group.value} label={group.label}>
              {group.levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </optgroup>
          ))}
        </NativeSelect>
        {levels.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            La taxonomie n&apos;est pas encore installée côté Supabase : vous pourrez choisir
            votre classe depuis votre profil.
          </p>
        ) : null}
      </div>

      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? "Création…" : "Créer mon compte"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        En créant un compte, vous acceptez les{" "}
        <Link href="/cgu" className="underline underline-offset-2 hover:text-foreground">
          conditions d&apos;utilisation
        </Link>{" "}
        et la{" "}
        <Link
          href="/confidentialite"
          className="underline underline-offset-2 hover:text-foreground"
        >
          politique de confidentialité
        </Link>
        .
      </p>
    </form>
  );
}
