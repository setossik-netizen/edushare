import Link from "next/link";
import { Database } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupNotice() {
  return (
    <Card className="w-full">
      <CardHeader>
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Database className="size-5" aria-hidden="true" />
        </span>
        <CardTitle className="mt-3 text-lg">Supabase n&apos;est pas encore configuré</CardTitle>
        <CardDescription className="leading-relaxed">
          L&apos;authentification a besoin d&apos;un projet Supabase. Le catalogue public continue de
          fonctionner sans lui.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Créez un projet gratuit sur{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              supabase.com
            </a>
            .
          </li>
          <li>
            Copiez <code className="rounded bg-muted px-1 py-0.5">.env.example</code> en{" "}
            <code className="rounded bg-muted px-1 py-0.5">.env.local</code> et renseignez
            l&apos;URL du projet et la clé anonyme.
          </li>
          <li>
            Appliquez <code className="rounded bg-muted px-1 py-0.5">supabase/migrations</code>{" "}
            puis <code className="rounded bg-muted px-1 py-0.5">supabase/seed.sql</code>.
          </li>
          <li>Redémarrez le serveur de développement.</li>
        </ol>
        <p>
          Le guide détaillé se trouve dans{" "}
          <span className="font-medium text-foreground">docs/supabase-setup.md</span>.
        </p>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Retour à l&apos;accueil
        </Link>
      </CardContent>
    </Card>
  );
}
