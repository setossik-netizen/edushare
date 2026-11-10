"use client";

import Link from "next/link";
import {
  ChevronDown,
  FileStack,
  LayoutDashboard,
  LogOut,
  UserRound,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/actions/auth";
import type { HeaderUser } from "@/lib/auth-types";
import { cn } from "@/lib/utils";

export function UserMenu({ user }: { user: HeaderUser }) {
  const initials = user.username.slice(0, 2).toUpperCase();
  const isStaff = user.role === "moderator" || user.role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "ghost" }), "gap-2 px-2")}
      >
        <span
          className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="max-w-28 truncate">{user.username}</span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" style={{ width: "15rem" }}>
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground">
            {user.username}
          </span>
          <span className="truncate text-xs font-normal">{user.email}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href="/profil" />}>
          <UserRound aria-hidden="true" />
          Mon profil
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/mes-contributions" />}>
          <FileStack aria-hidden="true" />
          Mes contributions
        </DropdownMenuItem>
        {isStaff ? (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <LayoutDashboard aria-hidden="true" />
            Modération
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />

        <form action={signOutAction}>
          <DropdownMenuItem
            variant="destructive"
            render={<button type="submit" className="w-full" />}
          >
            <LogOut aria-hidden="true" />
            Se déconnecter
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
