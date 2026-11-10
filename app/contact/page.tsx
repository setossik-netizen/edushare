import type { Metadata } from "next";
import { Mail, UserRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter le développeur d'EduShare.",
};

export default function ContactPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-3 text-muted-foreground">
        Pour toute question, suggestion, partenariat ou signalement concernant EduShare,
        vous pouvez contacter le développeur.
      </p>

      <section className="mt-10 rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold tracking-tight">Développeur</h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="font-medium">Nom</dt>
              <dd className="text-muted-foreground">Setossi Elysee</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="font-medium">E-mail</dt>
              <dd>
                <a
                  href="mailto:setossik@gmail.com"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  setossik@gmail.com
                </a>
              </dd>
            </div>
          </div>
        </dl>
      </section>
    </article>
  );
}
