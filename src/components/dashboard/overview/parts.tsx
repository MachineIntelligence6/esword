import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Shared building blocks for the dashboard overview. Colours use the classes
// tailwind.css already remaps for dark mode (bg-white, border-slate-200,
// text-slate-*, text-primary); bar fills and semantic colours set their own
// dark: variants.

export type Tone = "bad" | "warn" | "ok";

export const toneText: Record<Tone, string> = {
    bad: "text-red-600 dark:text-red-400",
    warn: "text-amber-700 dark:text-amber-400",
    ok: "text-emerald-700 dark:text-emerald-400",
};

const toneDot: Record<Tone, string> = {
    bad: "bg-red-500",
    warn: "bg-amber-500",
    ok: "bg-emerald-500",
};

const tonePill: Record<Tone, string> = {
    bad: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
    warn: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    ok: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
};

export const linkClass = "text-primary-700 hover:underline dark:text-[#d97757]";

export const fmt = (n: number) => n.toLocaleString("en-US");

export function pct(n: number, of: number) {
    if (!of) return 0;
    const p = (n / of) * 100;
    // Keep a sliver of progress visible instead of rounding it away to 0%.
    return p > 0 && p < 1 ? Math.round(p * 10) / 10 : Math.round(p);
}

export function Panel({ title, sub, action, className, children }: {
    title: string;
    sub?: ReactNode;
    action?: ReactNode;
    className?: string;
    children: ReactNode;
}) {
    return (
        <section className={cn("min-w-0 rounded-sm border border-slate-200 bg-white", className)}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-5 pt-4">
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                {sub ? <span className="text-sm text-slate-500">{sub}</span> : null}
                {action}
            </div>
            <div className="px-5 pb-5 pt-3">{children}</div>
        </section>
    );
}

export function StatTile({ label, value, meta, tone, href }: {
    label: string;
    value: number;
    meta: string;
    tone?: Tone;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="flex min-w-0 flex-col gap-0.5 rounded-sm border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:border-primary"
        >
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
            <span className="text-2xl font-bold tabular-nums text-slate-900">{fmt(value)}</span>
            <span className={cn("truncate text-sm", tone ? toneText[tone] : "text-slate-500")}>{meta}</span>
        </Link>
    );
}

export function Bar({ value, className }: { value: number; className?: string }) {
    return (
        <span className={cn("block h-2 overflow-hidden rounded-full bg-slate-200", className)}>
            <span
                className="block h-full rounded-full bg-primary dark:bg-[#c6613f]"
                style={{ width: `${Math.min(100, Math.max(0, value))}%`, minWidth: value > 0 ? 3 : 0 }}
            />
        </span>
    );
}

export function Dot({ tone }: { tone: Tone }) {
    return <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", toneDot[tone])} aria-hidden />;
}

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
    return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", tonePill[tone])}>{children}</span>;
}

export function PanelSkeleton({ className }: { className?: string }) {
    return <div className={cn("min-h-[180px] animate-pulse rounded-sm border border-slate-200 bg-white", className)} />;
}
