import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerAuth } from "@/server/auth";
import { PanelSkeleton } from "@/components/dashboard/overview/parts";
import {
    ActivitySection, BookProgressSection, CoverageSection, ReadersSection, TotalsSection,
} from "@/components/dashboard/overview/sections";

export default async function Page() {
    const session = await getServerAuth();
    if (!session) return redirect("/login");
    const viewer = { role: session.user.role, userId: Number(session.user.id) };

    return (
        <div className="flex min-h-full flex-col gap-5">
            <div>
                <h1 className="text-2xl font-bold leading-8 text-slate-950">Dashboard</h1>
                <p className="text-sm text-slate-500">
                    Welcome back, {session.user.name}. Here is where the library stands and what still needs work.
                </p>
            </div>
            <Suspense fallback={<PanelSkeleton className="min-h-[200px]" />}>
                <TotalsSection {...viewer} />
            </Suspense>
            <Suspense fallback={<PanelSkeleton className="min-h-[260px]" />}>
                <CoverageSection {...viewer} />
            </Suspense>
            <Suspense fallback={<PanelSkeleton className="min-h-[420px]" />}>
                <BookProgressSection />
            </Suspense>
            <Suspense fallback={<PanelSkeleton className="min-h-[320px]" />}>
                <ActivitySection {...viewer} />
            </Suspense>
            <Suspense fallback={null}>
                <ReadersSection {...viewer} />
            </Suspense>
        </div>
    );
}
