"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./header";

export function ConditionalSiteHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) return null;
  return <SiteHeader />;
}
