"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { BookProgress } from "@/server/dashboard";
import { cn } from "@/lib/utils";
import { Bar, Pill, Tone, fmt, linkClass, pct } from "./parts";

const COLLAPSED_ROWS = 8;

type Sort = "largest" | "least";

function completion(b: BookProgress) {
    return (pct(b.versesWithCommentary, b.verses) + pct(b.chaptersWithIntro, b.chapters)) / 2;
}

function status(b: BookProgress): [Tone, string] {
    const c = completion(b);
    if (c >= 95) return ["ok", "Complete"];
    if (c > 0) return ["warn", "In progress"];
    return ["bad", "Not started"];
}

function MiniBar({ n, of }: { n: number; of: number }) {
    const p = pct(n, of);
    return (
        <span className="inline-flex items-center gap-2">
            <Bar value={p} className="h-1.5 w-16" />
            <span className="w-10 text-right tabular-nums text-slate-600">{p}%</span>
        </span>
    );
}

export function BookProgressTable({ books }: { books: BookProgress[] }) {
    const router = useRouter();
    const [sort, setSort] = useState<Sort>("largest");
    const [expanded, setExpanded] = useState(false);
    const sorted = useMemo(() => {
        const list = [...books];
        if (sort === "largest") list.sort((a, b) => b.verses - a.verses);
        else list.sort((a, b) => completion(a) - completion(b) || b.verses - a.verses);
        return list;
    }, [books, sort]);
    const rows = expanded ? sorted : sorted.slice(0, COLLAPSED_ROWS);

    return (
        <div>
            <div className="mb-3 inline-flex rounded-sm border border-slate-200 bg-slate-100 p-0.5 text-sm" role="group" aria-label="Sort books">
                {([["largest", "Largest first"], ["least", "Least complete"]] as const).map(([key, label]) => (
                    <button
                        key={key}
                        type="button"
                        aria-pressed={sort === key}
                        onClick={() => setSort(key)}
                        className={cn(
                            "rounded-xs px-3 py-1 text-slate-600",
                            sort === key && "bg-white font-semibold text-slate-900 shadow-sm",
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                            <th className="px-2.5 py-2 font-medium">Book</th>
                            <th className="px-2.5 py-2 text-right font-medium">Chapters</th>
                            <th className="px-2.5 py-2 text-right font-medium">Verses</th>
                            <th className="px-2.5 py-2 font-medium">Commentary</th>
                            <th className="px-2.5 py-2 font-medium">Chapter intros</th>
                            <th className="px-2.5 py-2 font-medium">Audio</th>
                            <th className="px-2.5 py-2 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {rows.map((b) => {
                            const [tone, label] = status(b);
                            return (
                                <tr
                                    key={b.id}
                                    onClick={() => router.push(`/dashboard/books/${b.id}`)}
                                    className="cursor-pointer whitespace-nowrap hover:bg-slate-50"
                                >
                                    <td className="px-2.5 py-2.5">
                                        <Link href={`/dashboard/books/${b.id}`} className="font-medium text-slate-900 hover:underline" onClick={(e) => e.stopPropagation()}>
                                            {b.name}
                                        </Link>
                                    </td>
                                    <td className="px-2.5 py-2.5 text-right tabular-nums">{fmt(b.chapters)}</td>
                                    <td className="px-2.5 py-2.5 text-right tabular-nums">{fmt(b.verses)}</td>
                                    <td className="px-2.5 py-2.5"><MiniBar n={b.versesWithCommentary} of={b.verses} /></td>
                                    <td className="px-2.5 py-2.5"><MiniBar n={b.chaptersWithIntro} of={b.chapters} /></td>
                                    <td className="px-2.5 py-2.5"><MiniBar n={b.versesWithAudio} of={b.verses} /></td>
                                    <td className="px-2.5 py-2.5"><Pill tone={tone}>{label}</Pill></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {books.length > COLLAPSED_ROWS && (
                <button type="button" onClick={() => setExpanded(!expanded)} className={cn("mt-3 text-sm", linkClass)}>
                    {expanded ? "Show fewer" : `Show all ${books.length} books`}
                </button>
            )}
        </div>
    );
}
