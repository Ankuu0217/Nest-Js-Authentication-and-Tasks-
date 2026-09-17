import { cn } from "@/lib/utils";

export function CenteredCardLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment-cream px-4 py-16">
      <div className={cn("w-full max-w-md", className)}>{children}</div>
    </div>
  );
}
