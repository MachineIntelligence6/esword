import "server-only";
import { cache } from "react";
import { ActivityActionType, ActivityModelType, Prisma, UserRole } from "@prisma/client";
import db from "@/server/db";

const live = { archived: false } as const;

// Rows an activity entry stands for. Bulk entries end in "… 12 chapters" and
// import summaries in "… 2,994 verses into II Psalms (…)" (see activity-log.ts);
// every other entry is one change.
const entryCount = Prisma.sql`COALESCE(CAST(REPLACE(SUBSTRING_INDEX(
    REGEXP_SUBSTR(description, '[0-9][0-9,]* [a-z]+( into .*)?$'), ' ', 1), ',', '') AS UNSIGNED), 1)`;

const toNumber = (v: bigint | number | null | undefined) => Number(v ?? 0);

export const getTotals = cache(async (role: UserRole, userId: number) => {
    const isAdmin = role === "ADMIN";
    const since30 = new Date(Date.now() - 30 * 864e5);
    const noteWhere = isAdmin ? live : { ...live, userId };
    const [
        books, chapters, topics, verses, versesLast30, commentaries, authors,
        notes, noteAuthors, blogsByStatus, usersByRole,
        booksNoChapters, topicsNoVerses,
        versesWithCommentary, chaptersWithIntro, versesWithAudio, booksWithPublishedBlog,
    ] = await Promise.all([
        db.book.count({ where: live }),
        db.chapter.count({ where: live }),
        db.topic.count({ where: live }),
        db.verse.count({ where: live }),
        db.verse.count({ where: { ...live, createdAt: { gte: since30 } } }),
        db.commentary.count({ where: live }),
        db.author.count({ where: live }),
        db.note.count({ where: noteWhere }),
        db.note.groupBy({ by: ["userId"], where: noteWhere }).then((r) => r.length),
        db.blog.groupBy({ by: ["status"], where: live, _count: true }),
        db.user.groupBy({ by: ["role"], where: live, _count: true }),
        db.book.count({ where: { ...live, chapters: { none: live } } }),
        db.topic.count({ where: { ...live, verses: { none: live } } }),
        db.verse.count({ where: { ...live, commentaries: { some: live } } }),
        db.chapter.count({ where: { ...live, commentaryText: { not: null }, NOT: { commentaryText: "" } } }),
        db.verse.count({ where: { ...live, audio: { not: null }, NOT: { audio: "" } } }),
        db.book.count({ where: { ...live, blogs: { some: { ...live, status: "PUBLISHED" } } } }),
    ]);
    const blogCount = (s: string) => blogsByStatus.find((b) => b.status === s)?._count ?? 0;
    const roleCount = (r: UserRole) => usersByRole.find((u) => u.role === r)?._count ?? 0;
    return {
        books, chapters, topics, verses, versesLast30, commentaries, authors,
        notes, noteAuthors,
        blogs: { published: blogCount("PUBLISHED"), drafts: blogCount("DRAFT") },
        users: { ADMIN: roleCount("ADMIN"), EDITOR: roleCount("EDITOR"), VIEWER: roleCount("VIEWER") },
        booksNoChapters, topicsNoVerses,
        versesWithCommentary, chaptersWithIntro, versesWithAudio, booksWithPublishedBlog,
    };
});

export type DashboardTotals = Awaited<ReturnType<typeof getTotals>>;

export type BookProgress = {
    id: number;
    name: string;
    chapters: number;
    chaptersWithIntro: number;
    verses: number;
    versesWithCommentary: number;
    versesWithAudio: number;
};

export const getBookProgress = cache(async (): Promise<BookProgress[]> => {
    const rows = await db.$queryRaw<Array<Record<string, bigint | number | string>>>`
        SELECT b.id, b.name,
            COUNT(DISTINCT c.id) AS chapters,
            COUNT(DISTINCT CASE WHEN c.commentary_text IS NOT NULL AND c.commentary_text <> '' THEN c.id END) AS chaptersWithIntro,
            COUNT(v.id) AS verses,
            SUM(CASE WHEN v.audio IS NOT NULL AND v.audio <> '' THEN 1 ELSE 0 END) AS versesWithAudio,
            SUM(CASE WHEN EXISTS (SELECT 1 FROM commentaries cm WHERE cm.verse_id = v.id AND cm.archived = 0) THEN 1 ELSE 0 END) AS versesWithCommentary
        FROM books b
        LEFT JOIN chapters c ON c.book_id = b.id AND c.archived = 0
        LEFT JOIN topics t ON t.chapter_id = c.id AND t.archived = 0
        LEFT JOIN verses v ON v.topic_id = t.id AND v.archived = 0
        WHERE b.archived = 0
        GROUP BY b.id, b.name`;
    return rows.map((r) => ({
        id: toNumber(r.id as bigint),
        name: String(r.name),
        chapters: toNumber(r.chapters as bigint),
        chaptersWithIntro: toNumber(r.chaptersWithIntro as bigint),
        verses: toNumber(r.verses as bigint),
        versesWithCommentary: toNumber(r.versesWithCommentary as bigint),
        versesWithAudio: toNumber(r.versesWithAudio as bigint),
    }));
});

/** Two or more active accounts sharing a display name (activity gets split between them). */
export async function getDuplicateUserNames() {
    const rows = await db.user.groupBy({ by: ["name"], where: live, _count: true });
    return rows.filter((r) => r._count > 1).map((r) => ({ name: r.name, count: r._count }));
}

export async function getChangesPerDay(days = 30) {
    const since = new Date(Date.now() - (days - 1) * 864e5);
    since.setUTCHours(0, 0, 0, 0);
    const rows = await db.$queryRaw<Array<{ day: Date | string; n: bigint | number }>>`
        SELECT DATE(timestamp) AS day, SUM(${entryCount}) AS n
        FROM activities WHERE timestamp >= ${since}
        GROUP BY DATE(timestamp)`;
    const byDay = new Map(rows.map((r) => [new Date(r.day).toISOString().slice(0, 10), toNumber(r.n)]));
    return Array.from({ length: days }, (_, i) => {
        const date = new Date(since.getTime() + i * 864e5).toISOString().slice(0, 10);
        return { date, count: byDay.get(date) ?? 0 };
    });
}

export async function getTopEditors(days = 30, take = 5) {
    const since = new Date(Date.now() - days * 864e5);
    const rows = await db.$queryRaw<Array<{ userId: number; name: string; role: UserRole; n: bigint | number }>>`
        SELECT a.user_id AS userId, u.name, u.role, SUM(${entryCount}) AS n
        FROM activities a JOIN users u ON u.id = a.user_id
        WHERE a.timestamp >= ${since}
        GROUP BY a.user_id, u.name, u.role
        ORDER BY n DESC LIMIT ${take}`;
    return rows.map((r) => ({ userId: Number(r.userId), name: r.name, role: r.role, count: toNumber(r.n) }));
}

export type ActivityGroup = {
    userName: string;
    summary: string;
    first: string;
    last: string;
};

const nouns: Record<ActivityModelType, [string, string]> = {
    AUTHORS: ["author", "authors"],
    BOOKMARKS: ["bookmark", "bookmarks"],
    COMMENTARIES: ["commentary", "commentaries"],
    BOOKS: ["book", "books"],
    CHAPTERS: ["chapter", "chapters"],
    TOPICS: ["topic", "topics"],
    VERSES: ["verse", "verses"],
    NOTES: ["note", "notes"],
    USERS: ["user", "users"],
    BLOGS: ["blog post", "blog posts"],
    ABOUTCONTENT: ["about page", "about page"],
};

const MERGE_GAP_MS = 5 * 60 * 1000;

/**
 * Recent activity with bursts folded into one line, e.g. a CSV import that
 * logged thousands of rows becomes "created 21,510 verses and 1,155 topics".
 * Entries are bucketed per user/action/model/minute in SQL, then neighbouring
 * buckets from the same user less than five minutes apart are merged.
 */
export async function getRecentActivityGroups(opts: { userId?: number; take?: number } = {}) {
    const take = opts.take ?? 6;
    const userFilter = opts.userId ? Prisma.sql`WHERE a.user_id = ${opts.userId}` : Prisma.empty;
    const buckets = await db.$queryRaw<Array<{
        userId: number; userName: string; action: ActivityActionType; model: ActivityModelType;
        entries: bigint | number; n: bigint | number; description: string; first: Date; last: Date;
    }>>`
        SELECT a.user_id AS userId, u.name AS userName, a.action, a.model,
            COUNT(*) AS entries, SUM(${entryCount}) AS n, MAX(a.description) AS description,
            MIN(a.timestamp) AS first, MAX(a.timestamp) AS last
        FROM activities a JOIN users u ON u.id = a.user_id
        ${userFilter}
        GROUP BY a.user_id, u.name, a.action, a.model, DATE_FORMAT(a.timestamp, '%Y-%m-%d %H:%i')
        ORDER BY last DESC
        LIMIT 1000`;

    type Group = { userId: number; userName: string; first: Date; last: Date; parts: Map<string, number>; descriptions: string[]; entries: number };
    const groups: Group[] = [];
    for (const b of buckets) {
        const current = groups[groups.length - 1];
        const key = `${b.action}|${b.model}`;
        if (current && current.userId === Number(b.userId) && current.first.getTime() - new Date(b.last).getTime() <= MERGE_GAP_MS) {
            current.parts.set(key, (current.parts.get(key) ?? 0) + toNumber(b.n));
            current.descriptions.push(b.description);
            current.entries += toNumber(b.entries);
            current.first = new Date(b.first);
        } else {
            if (groups.length === take) break;
            groups.push({
                userId: Number(b.userId), userName: b.userName,
                first: new Date(b.first), last: new Date(b.last),
                parts: new Map([[key, toNumber(b.n)]]), descriptions: [b.description], entries: toNumber(b.entries),
            });
        }
    }

    return groups.map((g): ActivityGroup => ({
        userName: g.userName,
        summary: g.entries === 1 ? stripUserName(g.descriptions[0], g.userName) : summarizeParts(g.parts),
        first: g.first.toISOString(),
        last: g.last.toISOString(),
    }));
}

function stripUserName(description: string, userName: string) {
    return description.startsWith(`${userName} `) ? description.slice(userName.length + 1) : description;
}

function summarizeParts(parts: Map<string, number>) {
    const byAction = new Map<ActivityActionType, Array<[ActivityModelType, number]>>();
    parts.forEach((n, key) => {
        const [action, model] = key.split("|") as [ActivityActionType, ActivityModelType];
        byAction.set(action, [...(byAction.get(action) ?? []), [model, n]]);
    });
    const order: ActivityActionType[] = ["CREATE", "UPDATE", "ARCHIVE", "RESTORE", "DELETE"];
    return order
        .filter((a) => byAction.has(a))
        .map((action) => {
            const items = byAction.get(action)!.sort((a, b) => b[1] - a[1]);
            const shown = items.slice(0, 3).map(([model, n]) => `${n.toLocaleString("en-US")} ${nouns[model][n === 1 ? 0 : 1]}`);
            if (items.length > 3) shown.push("more");
            const list = shown.length > 1 ? `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}` : shown[0];
            return `${action.toLowerCase()}d ${list}`;
        })
        .join(", ");
}

export async function getReaderStats() {
    const [bookmarks, highlights, notes, topBookmarked, newestUsers] = await Promise.all([
        db.bookmark.count(),
        db.highlight.count(),
        db.note.count({ where: live }),
        db.bookmark.groupBy({ by: ["verseId"], _count: true, orderBy: { _count: { verseId: "desc" } }, take: 5 }),
        db.user.findMany({ where: live, orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, role: true, createdAt: true } }),
    ]);
    const verses = topBookmarked.length
        ? await db.verse.findMany({
            where: { id: { in: topBookmarked.map((b) => b.verseId) } },
            select: { id: true, number: true, topic: { select: { chapter: { select: { name: true, book: { select: { name: true } } } } } } },
        })
        : [];
    const topVerses = topBookmarked.flatMap((b) => {
        const v = verses.find((x) => x.id === b.verseId);
        if (!v) return [];
        return [{ id: v.id, reference: `${v.topic.chapter.book.name} ${v.topic.chapter.name}:${v.number}`, count: b._count }];
    });
    return {
        bookmarks, highlights, notes, topVerses,
        newestUsers: newestUsers.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
    };
}
