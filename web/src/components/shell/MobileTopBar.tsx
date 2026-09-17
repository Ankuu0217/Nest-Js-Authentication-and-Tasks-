"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Wordmark } from "@/components/brand/Logo";
import { SlideOver } from "@/components/ui/SlideOver";
import { SidebarContent } from "./Sidebar";
import type { AuthUser } from "@/lib/api/types";

export function MobileTopBar({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b border-sand-gray bg-parchment-cream px-4 py-3 lg:hidden">
        <Wordmark />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-xl p-2 text-ink-black hover:bg-linen-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-violet"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </header>
      <SlideOver open={open} onClose={() => setOpen(false)} title="Menu" className="max-w-72">
        <SidebarContent user={user} onNavigate={() => setOpen(false)} />
      </SlideOver>
    </>
  );
}
