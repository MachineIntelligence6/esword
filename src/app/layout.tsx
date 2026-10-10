import AuthProvider from "@/components/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { getServerAuth } from "@/server/auth";
import "@/styles/tailwind.css";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import HydrationZustand from "@/components/zustand-hydration";
import { ConditionalSiteHeader } from "./chrome";
import AppShell from "./app-shell";
import DonationPopup from "@/components/frontend/donation-popup";
import { themeInitScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Hidden Sword",
  description: "",
  icons: {
    // The browser tab icon follows the OS/browser's own color scheme, same
    // as our CSS dark mode's `prefers-color-scheme` queries — independent of
    // the in-app Auto/Light/Dark toggle, which browsers don't expose to
    // favicon selection.
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-dark.ico", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuth();
  if (typeof session === "boolean" && session === false)
    return redirect("/api/auth/logout");
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={cn(
          "font-sans max-w-full !overflow-x-hidden overflow-hidden antialiased"
        )}
      >
        <HydrationZustand>
          <AuthProvider session={session}>
            <ConditionalSiteHeader />
            <AppShell>{children}</AppShell>
            <DonationPopup />
            <Toaster />
          </AuthProvider>
        </HydrationZustand>
      </body>
    </html>
  );
}
