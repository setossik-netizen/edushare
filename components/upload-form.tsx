"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { createResourceAction } from "@/lib/actions/resources";
import type { AuthActionState, LevelOption } from "@/lib/auth-types";
import { CYCLES, RESOURCE_TYPES } from "@/lib/taxonomy";

const initialState: AuthActionState = { status: "idle" };

type UploadFormProps = {
  levels: LevelOption[];
  subjects: { id: string; slug: string; label: string }[];
};

export function UploadForm({ levels, subjects }: UploadFormProps) {
  const [state, formAction, pending] = useActionState(createResourceAction, initialState);

  const groupedLevels = CYCLES.map((cycle) => ({
    ...cycle,
    levels: levels.filter((level) => level.cycle === cycle.value),
  })).filter((group) => group.levels.length > 0);

  const currentYear = new Date().getFullYear();

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {state.status !== "idle" && state.message ? (
        <FormAlert tone={state.status === "error" ? "error" : "success"}>
          {state.message}
        </FormAlert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          name="title"
          type="text"
          minLength={10}
          maxLength={120}
          placeholder="Examen de mathématiques — Terminale D — 2024"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          minLength={30}
          maxLength={2000}
          placeholder="Contenu du document, chapitres couverts, niveau de difficulté…"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="googleDriveUrl">Lien Google Drive</Label>
        <Input
          id="googleDriveUrl"
          name="googleDriveUrl"
          type="url"
          placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
          required
        />
        <p className="text-xs text-muted-foreground">
          Hébergez votre document sur Google Drive, mettez-le en accès public (« Tous les
          utilisateurs disposant du lien »), puis collez le lien de partage ici. Aucun
          fichier n&apos;est stocké sur nos serveurs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="levelId">Classe</Label>
          <NativeSelect id="levelId" name="levelId" defaultValue="" required>
            <option value="">Choisir une classe</option>
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

        <div className="space-y-2">
          <Label htmlFor="subjectId">Matière</Label>
          <NativeSelect id="subjectId" name="subjectId" defaultValue="" required>
            <option value="">Choisir une matière</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <NativeSelect id="type" name="type" defaultValue="COURS" required>
            {RESOURCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Année</Label>
          <NativeSelect id="year" name="year" defaultValue={String(currentYear)}>
            {Array.from({ length: 12 }, (_, index) => currentYear - index).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-2">
          <Label htmlFor="school">Établissement (optionnel)</Label>
          <Input id="school" name="school" type="text" maxLength={120} />
        </div>
      </div>

      <Button type="submit" className="h-10 w-full" disabled={pending}>
        {pending ? "Enregistrement…" : "Partager le lien"}
      </Button>
    </form>
  );
}
