import { Skeleton } from "@/components/ui/Skeleton";

export default function TasksLoading() {
  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-sand-gray bg-linen-beige/40 p-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
