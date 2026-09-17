"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  LayoutDashboard,
  ListTodo,
  Settings as SettingsIcon,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { Wordmark } from "@/components/brand/Logo";
import { Avatar } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { logout } from "@/lib/api/auth-client";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/api/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function SidebarContent({ user, onNavigate }: { user: AuthUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  const navItems =
    user.role === "admin"
      ? [...NAV_ITEMS, { href: "/admin" as const, label: "Admin", icon: ShieldCheck }]
      : NAV_ITEMS;

  return (
    <div className="flex h-full flex-col px-4 py-6">
      <Link href="/dashboard" className="px-2" onClick={onNavigate}>
        <Wordmark />
      </Link>

      <ul className="mt-8 flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-body-sm font-medium transition-colors",
                  isActive
                    ? "bg-linen-beige text-ink-black"
                    : "text-charcoal-stone hover:bg-linen-beige/60 hover:text-ink-black",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <DropdownMenu className="block w-full">
        <DropdownMenuTrigger
          aria-label="Open account menu"
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-linen-beige"
        >
          <Avatar userId={user.id} name={user.name} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body-sm font-medium text-ink-black">
              {user.name}
            </span>
            <span className="block truncate text-caption text-charcoal-stone">{user.email}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem
            onClick={() => {
              onNavigate?.();
              router.push("/settings");
            }}
          >
            <SettingsIcon className="size-4" aria-hidden="true" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem destructive onClick={() => logoutMutation.mutate()}>
            <LogOut className="size-4" aria-hidden="true" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function Sidebar({ user }: { user: AuthUser }) {
  return (
    <nav className="hidden h-full w-60 shrink-0 border-r border-sand-gray bg-parchment-cream lg:block">
      <SidebarContent user={user} />
    </nav>
  );
}
