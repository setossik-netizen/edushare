"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { toggleFavoriteAction } from "@/lib/actions/resources";
import { cn } from "@/lib/utils";

export function ToggleFavoriteButton({
  resourceId,
  initialFavorite,
}: {
  resourceId: string;
  initialFavorite: boolean;
}) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setFavorite((value) => !value);
        startTransition(() => {
          toggleFavoriteAction(formData);
        });
      }}
    >
      <input type="hidden" name="resourceId" value={resourceId} />
      <button
        type="submit"
        disabled={pending}
        className={cn(
          buttonVariants({ variant: favorite ? "default" : "outline", className: "w-full" }),
        )}
      >
        <Heart
          aria-hidden="true"
          className={favorite ? "fill-current" : ""}
        />
        {favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      </button>
    </form>
  );
}
