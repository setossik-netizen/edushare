import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-6xl font-semibold tracking-tight text-muted-foreground/40">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Page introuvable</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
