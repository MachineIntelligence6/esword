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

export const metadata: Metadata = {
  title: "Hidden Sword",
  description: "",
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
    <html lang="en">
      <body
        className={cn(
          "font-sans max-w-full !overflow-x-hidden overflow-hidden antialiased"
        )}
      >
        <HydrationZustand>
          <AuthProvider session={session}>
            <ConditionalSiteHeader />
            <AppShell>{children}</AppShell>
            <Toaster />
          </AuthProvider>
        </HydrationZustand>
      </body>
    </html>
  );
}
