"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import SiteInnerLayout from "@/app/inner-layout";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <div
      className={cn(
        "overflow-y-auto",
        isDashboard ? "h-screen" : "pt-[70px]"
      )}
    >
      <SiteInnerLayout>{children}</SiteInnerLayout>
    </div>
  );
}
