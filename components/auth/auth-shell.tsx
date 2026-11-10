import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-14 sm:px-6 sm:py-20">
      <div className="text-center">
        <h1 className="text-balance text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-pretty text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-8 rounded-xl border bg-card p-6 shadow-sm">{children}</div>

      {footer ? (
        <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
      ) : null}
    </div>
  );
}
