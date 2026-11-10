import Link from "next/link";
import { Construction } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PhasePlaceholderProps = {
  phase: string;
  title: string;
  description: string;
  bullets?: string[];
  primaryAction?: { href: string; label: string };
  secondaryAction?: { href: string; label: string };
};

export function PhasePlaceholder({
  phase,
  title,
  description,
  bullets,
  primaryAction,
  secondaryAction,
}: PhasePlaceholderProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <Badge variant="outline" className="gap-1.5">
        <Construction className="size-3" aria-hidden="true" />
        {phase}
      </Badge>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-4 text-pretty text-muted-foreground">{description}</p>

      {bullets && bullets.length > 0 && (
        <ul className="mt-8 w-full space-y-2 rounded-xl border bg-muted/30 p-5 text-left text-sm">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2 text-muted-foreground">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {bullet}
            </li>
          ))}
        </ul>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          {primaryAction && (
            <Link href={primaryAction.href} className={buttonVariants()}>
              {primaryAction.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
