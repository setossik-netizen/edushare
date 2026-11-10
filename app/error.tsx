"use client";

import { useEffect } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Une erreur est survenue</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Réessayez dans un instant. Si le problème persiste, contactez l&apos;équipe.
      </p>
      <div className="mt-6 flex gap-2">
        <button type="button" className={buttonVariants()} onClick={reset}>
          Réessayer
        </button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Accueil
        </Link>
      </div>
    </div>
  );
}
