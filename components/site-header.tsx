"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileStack,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserMenu } from "@/components/user-menu";
import { signOutAction } from "@/lib/actions/auth";
import type { HeaderUser } from "@/lib/auth-types";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/explorer", label: "Explorer" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/partager", label: "Partager" },
];

export function SiteHeader() {
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = user?.username.slice(0, 2).toUpperCase() ?? "";
  const isStaff = user?.role === "moderator" || user?.role === "admin";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="EduShare, accueil">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">EduShare</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link href="/connexion" className={buttonVariants({ variant: "ghost" })}>
                Se connecter
              </Link>
              <Link href="/inscription" className={buttonVariants()}>
                Créer un compte
              </Link>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")}
            aria-label="Ouvrir le menu"
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1 px-4" aria-label="Navigation mobile">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                        aria-hidden="true"
                      >
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.username}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      href="/profil"
                      onClick={() => setOpen(false)}
                      className={buttonVariants({ variant: "outline" })}
                    >
                      <UserRound aria-hidden="true" />
                      Mon profil
                    </Link>
                    <Link
                      href="/mes-contributions"
                      onClick={() => setOpen(false)}
                      className={buttonVariants({ variant: "outline" })}
                    >
                      <FileStack aria-hidden="true" />
                      Mes contributions
                    </Link>
                    {isStaff ? (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className={buttonVariants({ variant: "outline" })}
                      >
                        <LayoutDashboard aria-hidden="true" />
                        Modération
                      </Link>
                    ) : null}

                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
                      >
                        <LogOut aria-hidden="true" />
                        Se déconnecter
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/connexion"
                      onClick={() => setOpen(false)}
                      className={buttonVariants({ variant: "outline" })}
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/inscription"
                      onClick={() => setOpen(false)}
                      className={buttonVariants()}
                    >
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
