"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/lib/actions/auth";
import type { AuthActionState, LevelOption, SessionUser } from "@/lib/auth-types";
import { CYCLES } from "@/lib/taxonomy";

const initialState: AuthActionState = { status: "idle" };

type ProfileFormProps = {
  user: SessionUser;
  levels: LevelOption[];
};

export function ProfileForm({ user, levels }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  const groupedLevels = CYCLES.map((cycle) => ({
    ...cycle,
    levels: levels.filter((level) => level.cycle === cycle.value),
  })).filter((group) => group.levels.length > 0);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status !== "idle" && state.message ? (
        <FormAlert tone={state.status === "error" ? "error" : "success"}>
          {state.message}
        </FormAlert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">Pseudo</Label>
          <Input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            defaultValue={user.username}
            minLength={3}
            maxLength={20}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="levelId">Classe actuelle</Label>
          <NativeSelect
            id="levelId"
            name="levelId"
            defaultValue={user.currentLevelId ?? ""}
          >
            <option value="">Pas précisé</option>
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
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio courte</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={user.bio ?? ""}
          maxLength={280}
          rows={3}
          placeholder="Élève en Terminale D, passionné de mathématiques…"
        />
        <p className="text-xs text-muted-foreground">280 caractères maximum.</p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer les modifications"}
      </Button>
    </form>
  );
}
