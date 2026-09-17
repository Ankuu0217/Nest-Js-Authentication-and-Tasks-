"use client";

import { createContext, use, useId, useRef } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const ctx = use(TabsContext);
  if (!ctx) throw new Error(`<${component} /> must be used inside <Tabs>`);
  return ctx;
}

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  const baseId = useId();
  return (
    <TabsContext value={{ value, setValue: onValueChange, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext>
  );
}

export function TabsList({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
    if (currentIndex === -1) return;

    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    tabs[nextIndex]?.focus();
    tabs[nextIndex]?.click();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn("flex items-center gap-2 border-b border-sand-gray", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { value: activeValue, setValue, baseId } = useTabsContext("TabsTrigger");
  const isActive = value === activeValue;

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => setValue(value)}
      className={cn(
        "relative px-1 pb-3 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-violet focus-visible:ring-offset-2",
        isActive ? "text-ink-black" : "text-charcoal-stone hover:text-ink-black",
        className,
      )}
      {...props}
    >
      {children}
      {isActive && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 bg-ink-black" aria-hidden="true" />
      )}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { value: activeValue, baseId } = useTabsContext("TabsContent");
  if (value !== activeValue) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}
