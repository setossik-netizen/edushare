import { CircleAlert, CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type FormAlertProps = {
  tone?: "error" | "success";
  children: React.ReactNode;
  className?: string;
};

export function FormAlert({ tone = "error", children, className }: FormAlertProps) {
  const Icon = tone === "error" ? CircleAlert : CircleCheck;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-2 rounded-lg border px-3 py-2 text-sm",
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-primary/30 bg-primary/10 text-foreground",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
