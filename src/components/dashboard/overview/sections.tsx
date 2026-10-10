import Link from "next/link";
import { UserRole } from "@prisma/client";
import {
    getBookProgress, getChangesPerDay, getDuplicateUserNames, getReaderStats,
    getRecentActivityGroups, getTopEditors, getTotals, type ActivityGroup,
} from "@/server/dashboard";
import { cn } from "@/lib/utils";
import { BookProgressTable } from "./book-progress-table";
import { ChangesChart } from "./changes-chart";
import { ShortDate, TimeRange } from "./local-time";
import { Bar, Dot, Panel, StatTile, Tone, fmt, linkClass, pct } from "./parts";

type Viewer = { role: UserRole; userId: number };

const roleLabel: Record<UserRole, string> = { ADMIN: "Admin", EDITOR: "Editor", VIEWER: "Viewer" };

function plural(n: number, one: string, many: string) {
    return `${fmt(n)} ${n === 1 ? one : many}`;
}

export async function TotalsSection({ role, userId }: Viewer) {
    const t = await getTotals(role, userId);
    const isAdmin = role === "ADMIN";
    const blogTotal = t.blogs.published + t.blogs.drafts;
    const userTotal = t.users.ADMIN + t.users.EDITOR + t.users.VIEWER;
    return (
        <section aria-label="Totals" className={cn("grid grid-cols-2 gap-3 md:grid-cols-3", isAdmin ? "xl:grid-cols-4" : "xl:grid-cols-3")}>
            <StatTile label="Books" value={t.books} href="/dashboard/books"
                meta={t.booksNoChapters ? `${plural(t.booksNoChapters, "book", "books")} without chapters` : "All have chapters"}
                tone={t.booksNoChapters ? "warn" : undefined} />
            <StatTile label="Chapters" value={t.chapters} href="/dashboard/chapters"
                meta={t.books ? `About ${Math.round(t.chapters / t.books)} per book` : "No books yet"} />
            <StatTile label="Topics" value={t.topics} href="/dashboard/topics"
                meta={t.topicsNoVerses ? `${plural(t.topicsNoVerses, "topic", "topics")} without verses` : "All have verses"}
                tone={t.topicsNoVerses ? "warn" : undefined} />
            <StatTile label="Verses" value={t.verses} href="/dashboard/verses"
                meta={t.versesLast30 ? `+${fmt(t.versesLast30)} in the last 30 days` : "None added in 30 days"} />
            <StatTile label="Commentaries" value={t.commentaries} href="/dashboard/commentaries"
                meta={t.authors ? `By ${plural(t.authors, "author", "authors")}` : "No authors added yet"}
                tone={t.authors ? undefined : "warn"} />
            <StatTile label={isAdmin ? "Notes" : "Your notes"} value={t.notes} href="/dashboard/notes"
                meta={isAdmin ? (t.notes ? `By ${plural(t.noteAuthors, "user", "users")}` : "No notes yet") : "Written by you"} />
            {isAdmin && (
                <StatTile label="Blog posts" value={blogTotal} href="/dashboard/blogs"
                    meta={blogTotal ? `${fmt(t.blogs.published)} published · ${fmt(t.blogs.drafts)} drafts` : "Nothing drafted yet"} />
            )}
            {isAdmin && (
                <StatTile label="Users" value={userTotal} href="/dashboard/users"
                    meta={`${plural(t.users.ADMIN, "admin", "admins")} · ${plural(t.users.EDITOR, "editor", "editors")} · ${plural(t.users.VIEWER, "viewer", "viewers")}`} />
            )}
        </section>
    );
}

type Attention = { tone: Tone; title: string; detail?: string; href?: string; action?: string };

export async function CoverageSection({ role, userId }: Viewer) {
    const isAdmin = role === "ADMIN";
    const [t, books, duplicates] = await Promise.all([
        getTotals(role, userId),
        getBookProgress(),
        isAdmin ? getDuplicateUserNames() : Promise.resolve([]),
    ]);

    const coverage = [
        { label: "Verses with commentary", n: t.versesWithCommentary, of: t.verses,
          hint: t.authors ? undefined : "Add an author first. Every commentary needs one." },
        { label: "Chapters with an introduction", n: t.chaptersWithIntro, of: t.chapters },
        { label: "Verses with audio", n: t.versesWithAudio, of: t.verses },
        { label: "Books with a published blog post", n: t.booksWithPublishedBlog, of: t.books },
    ];

    const items: Attention[] = [];
    if (!t.authors) {
        items.push({ tone: "bad", title: "No commentary authors", detail: "Commentaries can't be added until an author exists.", href: "/dashboard/authors", action: "Add author" });
    }
    const versesWithout = t.verses - t.versesWithCommentary;
    if (versesWithout > 0) {
        const target = [...books].filter((b) => b.verses > 0)
            .sort((a, b) => pct(a.versesWithCommentary, a.verses) - pct(b.versesWithCommentary, b.verses) || b.verses - a.verses)[0];
        const detail = !target ? undefined
            : target.versesWithCommentary === 0 ? `Start with ${target.name} (${plural(target.verses, "verse", "verses")}, none covered).`
            : `Least complete: ${target.name} (${pct(target.versesWithCommentary, target.verses)}%).`;
        items.push({ tone: t.versesWithCommentary ? "warn" : "bad", title: `${plural(versesWithout, "verse", "verses")} without commentary`, detail, href: "/dashboard/commentaries", action: "Open commentaries" });
    }
    const chaptersWithout = t.chapters - t.chaptersWithIntro;
    if (chaptersWithout > 0) {
        items.push({ tone: "warn", title: `${plural(chaptersWithout, "chapter", "chapters")} without an introduction`, detail: "The chapter commentary text shown above each chapter is empty.", href: "/dashboard/chapters", action: "Open chapters" });
    }
    if (t.booksNoChapters) {
        items.push({ tone: "warn", title: `${plural(t.booksNoChapters, "book has", "books have")} no chapters`, href: "/dashboard/books", action: "Open books" });
    }
    if (t.topicsNoVerses) {
        items.push({ tone: "warn", title: `${plural(t.topicsNoVerses, "topic has", "topics have")} no verses`, href: "/dashboard/topics", action: "Open topics" });
    }
    if (isAdmin) {
        if (t.blogs.drafts) {
            items.push({ tone: "warn", title: `${plural(t.blogs.drafts, "blog draft", "blog drafts")} waiting`, href: "/dashboard/blogs", action: "Review drafts" });
        } else if (!t.blogs.published) {
            items.push({ tone: "warn", title: "No blog posts yet", detail: "The blog section of the site is empty.", href: "/dashboard/blogs", action: "Write post" });
        }
        for (const d of duplicates) {
            items.push({ tone: "warn", title: `${d.count} accounts named ${d.name}`, detail: "Their activity is split between them. Rename or merge one.", href: "/dashboard/users", action: "Open users" });
        }
    }
    const open = items.length;
    if (!open) items.push({ tone: "ok", title: "Nothing needs attention", detail: "Every book, chapter and verse is covered." });

    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Panel title="Content coverage" sub="How much of the library is finished">
                <div className="flex flex-col gap-4">
                    {coverage.map((c) => {
                        const p = pct(c.n, c.of);
                        return (
                            <div key={c.label}>
                                <div className="flex flex-wrap justify-between gap-x-3 text-sm">
                                    <span className="text-slate-900">{c.label}</span>
                                    <span className="tabular-nums text-slate-500">{fmt(c.n)} of {fmt(c.of)} · {p}%</span>
                                </div>
                                <Bar value={p} className="mt-1.5" />
                                {c.hint && <p className="mt-1 text-xs text-slate-500">{c.hint}</p>}
                            </div>
                        );
                    })}
                </div>
            </Panel>
            <Panel title="Needs attention" sub={open ? plural(open, "item", "items") : undefined}>
                <ul className="flex flex-col divide-y divide-slate-200">
                    {items.map((item) => (
                        <li key={item.title} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                            <Dot tone={item.tone} />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                {item.detail && <p className="text-sm text-slate-500">{item.detail}</p>}
                            </div>
                            {item.href && (
                                <Link href={item.href} className={cn("shrink-0 whitespace-nowrap text-sm", linkClass)}>{item.action}</Link>
                            )}
                        </li>
                    ))}
                </ul>
            </Panel>
        </div>
    );
}

export async function BookProgressSection() {
    const books = await getBookProgress();
    return (
        <Panel title="Progress by book" sub="Click a row to open the book">
            {books.length ? <BookProgressTable books={books} /> : <p className="text-sm text-slate-500">No books yet.</p>}
        </Panel>
    );
}

function initials(name: string) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function ActivityFeed({ groups, showUser }: { groups: ActivityGroup[]; showUser: boolean }) {
    if (!groups.length) return <p className="text-sm text-slate-500">No activity yet.</p>;
    return (
        <ul className="flex flex-col divide-y divide-slate-200">
            {groups.map((g) => (
                <li key={`${g.userName}-${g.last}`} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-25 text-xs font-semibold text-primary-700 dark:text-[#d97757]" aria-hidden>
                        {initials(g.userName)}
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm text-slate-900">{showUser ? `${g.userName} ${g.summary}` : capitalize(g.summary)}</p>
                        <p className="text-xs text-slate-500"><TimeRange first={g.first} last={g.last} /></p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function ActivitySection({ role, userId }: Viewer) {
    if (role !== "ADMIN") {
        const groups = await getRecentActivityGroups({ userId, take: 8 });
        return (
            <Panel title="Your recent edits">
                <ActivityFeed groups={groups} showUser={false} />
            </Panel>
        );
    }

    const [days, groups, editors] = await Promise.all([
        getChangesPerDay(30),
        getRecentActivityGroups({ take: 6 }),
        getTopEditors(30, 20),
    ]);
    const total = days.reduce((s, d) => s + d.count, 0);
    const busiest = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
    const topCount = editors[0]?.count ?? 0;
    const sameName = new Set(editors.map((e) => e.name).filter((n, i, all) => all.indexOf(n) !== i));

    return (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <Panel title="Changes per day" sub="Last 30 days">
                <ChangesChart days={days} />
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                    <span><b className="font-semibold tabular-nums text-slate-900">{fmt(total)}</b> changes</span>
                    {busiest?.count > 0 && (
                        <span>
                            <b className="font-semibold text-slate-900">
                                {new Date(`${busiest.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })}
                            </b>{" "}busiest day ({fmt(busiest.count)})
                        </span>
                    )}
                    <span><b className="font-semibold text-slate-900">{editors.length}</b> {editors.length === 1 ? "person" : "people"} editing</span>
                </div>
            </Panel>
            <Panel title="Recent activity" action={<Link href="/dashboard/activities" className={cn("text-sm", linkClass)}>View all</Link>}>
                <ActivityFeed groups={groups} showUser />
                {editors.length > 0 && (
                    <>
                        <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wider text-slate-500">Who&apos;s editing · 30 days</p>
                        <div className="flex flex-col gap-2.5">
                            {editors.slice(0, 5).map((e) => (
                                <div key={e.userId}>
                                    <div className="flex justify-between gap-3 text-sm">
                                        <span className="truncate text-slate-900">
                                            {e.name}{" "}
                                            <span className="text-slate-500">{roleLabel[e.role].toLowerCase()}{sameName.has(e.name) ? ` · #${e.userId}` : ""}</span>
                                        </span>
                                        <span className="tabular-nums text-slate-500">{fmt(e.count)}</span>
                                    </div>
                                    <Bar value={pct(e.count, topCount)} className="mt-1 h-1.5" />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Panel>
        </div>
    );
}

export async function ReadersSection({ role, userId }: Viewer) {
    if (role !== "ADMIN") return null;
    const [t, r] = await Promise.all([getTotals(role, userId), getReaderStats()]);
    const userTotal = t.users.ADMIN + t.users.EDITOR + t.users.VIEWER;
    const segments: Array<[UserRole, string, string]> = [
        ["ADMIN", "bg-primary-700 dark:bg-[#d97757]", "admins"],
        ["EDITOR", "bg-primary dark:bg-[#c6613f]", "editors"],
        ["VIEWER", "bg-slate-400 dark:bg-[#9c9a92]", "viewers"],
    ];
    return (
        <section aria-label="Readers" className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Readers · visible to admins only</p>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Panel title="Accounts" sub={`${fmt(userTotal)} total`}>
                    <div className="mb-3 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
                        {segments.map(([key, color]) => t.users[key] > 0 && (
                            <span key={key} className={color} style={{ width: `${pct(t.users[key], userTotal)}%` }} />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                        {segments.map(([key, color, label]) => (
                            <span key={key} className="inline-flex items-center gap-1.5">
                                <span className={cn("h-2 w-2 rounded-xs", color)} />{fmt(t.users[key])} {label}
                            </span>
                        ))}
                    </div>
                </Panel>
                <Panel title="Reader activity" sub="All time">
                    <div className="grid grid-cols-3 gap-2">
                        {([["Bookmarks", r.bookmarks], ["Highlights", r.highlights], ["Notes", r.notes]] as const).map(([label, n]) => (
                            <div key={label} className="rounded-sm bg-slate-100 p-2.5">
                                <span className="block text-xs text-slate-500">{label}</span>
                                <b className="text-lg tabular-nums text-slate-900">{fmt(n)}</b>
                            </div>
                        ))}
                    </div>
                    {r.topVerses.length ? (
                        <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                            <li className="text-xs font-medium uppercase tracking-wider text-slate-500">Most bookmarked</li>
                            {r.topVerses.map((v) => (
                                <li key={v.id} className="flex justify-between gap-3">
                                    <Link href={`/dashboard/verses/${v.id}`} className={cn("truncate", linkClass)}>{v.reference}</Link>
                                    <span className="tabular-nums text-slate-500">{fmt(v.count)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-3 rounded-sm bg-slate-100 p-3 text-sm text-slate-500">
                            The most-bookmarked verses will be listed here once readers start saving them.
                        </p>
                    )}
                </Panel>
                <Panel title="Newest accounts" action={<Link href="/dashboard/users" className={cn("text-sm", linkClass)}>All users</Link>}>
                    <ul className="flex flex-col divide-y divide-slate-200 text-sm">
                        {r.newestUsers.map((u) => (
                            <li key={u.id} className="flex justify-between gap-3 py-2 first:pt-0 last:pb-0">
                                <Link href={`/dashboard/users/${u.id}`} className="truncate text-slate-900 hover:underline">{u.name}</Link>
                                <span className="shrink-0 text-slate-500">{roleLabel[u.role]} · <ShortDate value={u.createdAt} /></span>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>
        </section>
    );
}
