import { ReactNode } from "react";
import DashboardSidebar, { ResponsiveSidebarButtton } from "./sidebar";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuth } from "@/server/auth";

export const metadata: Metadata = {
  title: "Dashboard - Hidden Sword",
  description: "",
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children?: ReactNode;
}) {
  const session = await getServerAuth();
  if (!session) return redirect("/login");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-silver-light">
      <DashboardSidebar
        session={session}
        variant="desktop"
        className="hidden h-screen shrink-0 xl:flex"
      />
      <DashboardSidebar
        session={session}
        variant="mobile"
        className="xl:hidden"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-2.5 xl:hidden">
          <ResponsiveSidebarButtton />
          <span className="text-sm font-semibold text-slate-800">Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
