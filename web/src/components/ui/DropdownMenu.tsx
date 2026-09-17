"use client";

import { createContext, use, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuId: string;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(component: string) {
  const ctx = use(DropdownMenuContext);
  if (!ctx) throw new Error(`<${component} /> must be used inside <DropdownMenu>`);
  return ctx;
}

export function DropdownMenu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  return (
    <DropdownMenuContext value={{ open, setOpen, triggerRef, menuId }}>
      <div className={cn("relative inline-block", className)}>{children}</div>
    </DropdownMenuContext>
  );
}

export function DropdownMenuTrigger({
  children,
  onClick,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerRef, menuId } = useDropdownMenuContext("DropdownMenuTrigger");

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      onClick={(event) => {
        onClick?.(event);
        setOpen(!open);
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function DropdownMenuContent({ children, align = "end", className }: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef, menuId } = useDropdownMenuContext("DropdownMenuContent");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (contentRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const items = Array.from(
        contentRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
      );
      if (items.length === 0) return;
      event.preventDefault();
      const currentIndex = items.findIndex((item) => item === document.activeElement);
      let nextIndex = currentIndex;
      if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
      if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
      items[nextIndex]?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    const firstItem = contentRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    firstItem?.focus();

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      id={menuId}
      role="menu"
      className={cn(
        "absolute z-40 mt-2 min-w-40 overflow-hidden rounded-xl border border-sand-gray bg-paper-white py-1 shadow-subtle-2",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destructive?: boolean;
}

export function DropdownMenuItem({
  className,
  destructive,
  onClick,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenuContext("DropdownMenuItem");
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-body-sm text-ink-black hover:bg-linen-beige focus-visible:bg-linen-beige focus-visible:outline-none",
        destructive && "text-coral-red-text",
        className,
      )}
      {...props}
    />
  );
}
