import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-sand-gray px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-linen-beige text-slate-warm">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-body font-semibold text-ink-black">{title}</p>
        {description && <p className="max-w-sm text-body-sm text-charcoal-stone">{description}</p>}
      </div>
      {action}
    </div>
  );
}
