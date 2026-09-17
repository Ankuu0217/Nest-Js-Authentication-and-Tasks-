import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-7 w-40 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex items-center gap-4">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <span className="flex-1 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-10" />
            </span>
          </Card>
        ))}
      </div>
      <Card>
        <Skeleton className="h-36 w-full" />
      </Card>
      <Card>
        <Skeleton className="h-40 w-full" />
      </Card>
    </div>
  );
}
