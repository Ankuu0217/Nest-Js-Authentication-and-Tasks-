import { redirect } from "next/navigation";
import { getDisplaySessionUser } from "@/lib/server/session";
import { Sidebar } from "@/components/shell/Sidebar";
import { MobileTopBar } from "@/components/shell/MobileTopBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getDisplaySessionUser();

  // Defense in depth: middleware already gates every route under this
  // layout, but a direct render (e.g. a stale cache) shouldn't be able to
  // show the shell without a user to show it for.
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar user={user} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
