"use client";

import { useActionState, useState } from "react";
import { Flag } from "lucide-react";

import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reportResourceAction } from "@/lib/actions/resources";
import type { AuthActionState } from "@/lib/auth-types";

const initialState: AuthActionState = { status: "idle" };

const REASONS = [
  { value: "DROIT_AUTEUR", label: "Droit d'auteur suspect" },
  { value: "CONTENU_INAPPROPRIE", label: "Contenu inapproprié" },
  { value: "DOCUMENT_ILLISIBLE", label: "Document illisible" },
  { value: "MAUVAISE_CLASSIFICATION", label: "Mauvaise classification" },
  { value: "DOUBLON", label: "Doublon" },
  { value: "AUTRE", label: "Autre" },
];

export function ReportDialog({ resourceId }: { resourceId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(reportResourceAction, initialState);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Flag aria-hidden="true" />
        Signaler
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="report-title" className="text-lg font-semibold">
              Signaler ce document
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Votre signalement est transmis aux modérateurs.
            </p>

            {state.status !== "idle" && state.message ? (
              <FormAlert
                tone={state.status === "error" ? "error" : "success"}
                className="mt-4"
              >
                {state.message}
              </FormAlert>
            ) : null}

            <form action={formAction} className="mt-4 space-y-4" noValidate>
              <input type="hidden" name="resourceId" value={resourceId} />

              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Motif
                </label>
                <select
                  id="reason"
                  name="reason"
                  required
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value="">Choisir un motif</option>
                  {REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">
                  Commentaire (optionnel)
                </label>
                <Textarea
                  id="comment"
                  name="comment"
                  rows={3}
                  maxLength={500}
                  placeholder="Précisions utiles pour la modération…"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Envoi…" : "Envoyer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
