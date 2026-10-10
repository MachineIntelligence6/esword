import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Activity, Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { ActivityDetails, IActivity } from "@/shared/types/models.types";
import { ActivitesPaginationProps } from "@/shared/types/pagination.types";
import { isAuthError, requireAdmin } from "./authz";




export async function getAll({
    page = 1, perPage = defaults.PER_PAGE_ITEMS,
    include, where, orderBy
}: ActivitesPaginationProps): Promise<PaginatedApiResponse<IActivity[]>> {
    try {
        const session = await requireAdmin()
        if (isAuthError(session)) return session
        const safeUserSelect = { id: true, name: true, email: true, role: true, image: true }
        const activities = await db.activity.findMany({
            where: where,
            orderBy: orderBy ? orderBy : {
                timestamp: "desc"
            },
            ...(perPage !== -1 && {
                take: perPage,
                skip: page <= 1 ? 0 : ((page - 1) * perPage),
            }),
            include: include ? {
                ...include,
                ...(include.user && { user: { select: safeUserSelect } })
            } : { user: { select: safeUserSelect } }
        })
        const activitiesCount = await db.activity.count({ where: where, })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: activities.length,
                totalPages: Math.ceil(activitiesCount / perPage),
                count: activitiesCount,
            },
            data: activities
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKNOWN_ERROR",
            data: null
        }
    }
}



export async function getById(id: number, include?: Prisma.ActivityInclude): Promise<ApiResponse<IActivity>> {
    try {
        const session = await requireAdmin()
        if (isAuthError(session)) return session
        const safeUserSelect = { id: true, name: true, email: true, role: true, image: true }
        const activity = await db.activity.findFirst({
            where: {
                id: id
            },
            include: include ? {
                ...include,
                ...(include.user && { user: { select: safeUserSelect } })
            } : { user: { select: safeUserSelect } }
        })
        if (!activity) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: activity
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKNOWN_ERROR",
            data: null
        }
    }
}



export async function archive(id: number): Promise<ApiResponse<null>> {
    try {
        const session = await requireAdmin()
        if (isAuthError(session)) return session
        await db.activity.delete({
            where: { id: id },
        })
        return {
            succeed: true,
            data: null
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKNOWN_ERROR",
            data: null
        }
    }
}



export async function archiveMany(ids: number[]): Promise<ApiResponse<any>> {
    try {
        const session = await requireAdmin()
        if (isAuthError(session)) return session
        let succeeded = 0;
        let failed = 0;

        for (let id of ids) {
            const res = await archive(id)
            if (res.succeed && res.data) succeeded += 1
            else failed += 1
        }

        return {
            succeed: true,
            data: {
                succeeded,
                failed
            }
        }
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR",
            data: null
        }
    }
}





const SNIPPET_LENGTH = 140;
function snippet(text: string) {
    const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return plain.length > SNIPPET_LENGTH ? `${plain.slice(0, SNIPPET_LENGTH)}…` : plain;
}

function notFoundDetails(label: string): ActivityDetails {
    return {
        exists: false,
        archived: false,
        breadcrumb: [],
        fields: [
            { label: "Note", value: `This ${label} no longer exists — it looks like it was permanently deleted.` },
        ],
        viewHref: null,
    };
}

async function resolveActivityDetails(activity: Activity): Promise<ActivityDetails> {
    if (!activity.ref) {
        return { exists: false, archived: false, breadcrumb: [], fields: [], viewHref: null };
    }
    const ref = activity.ref;

    switch (activity.model) {
        case "BOOKS": {
            const book = await db.book.findFirst({ where: { id: ref } });
            if (!book) return notFoundDetails("book");
            return {
                exists: true,
                archived: book.archived,
                breadcrumb: [book.name],
                fields: [
                    { label: "Name", value: book.name },
                    { label: "Slug", value: book.slug },
                    { label: "Abbreviation", value: book.abbreviation },
                ],
                viewHref: `/dashboard/books/${book.id}`,
            };
        }
        case "CHAPTERS": {
            const chapter = await db.chapter.findFirst({ where: { id: ref }, include: { book: true } });
            if (!chapter) return notFoundDetails("chapter");
            return {
                exists: true,
                archived: chapter.archived,
                breadcrumb: [chapter.book.name, `Chapter ${chapter.name}`],
                fields: [
                    { label: "Book", value: chapter.book.name },
                    { label: "Chapter", value: String(chapter.name) },
                    ...(chapter.commentaryName ? [{ label: "Commentary", value: chapter.commentaryName }] : []),
                ],
                viewHref: `/dashboard/chapters/${chapter.id}`,
            };
        }
        case "TOPICS": {
            const topic = await db.topic.findFirst({
                where: { id: ref },
                include: { chapter: { include: { book: true } } },
            });
            if (!topic) return notFoundDetails("topic");
            return {
                exists: true,
                archived: topic.archived,
                breadcrumb: [topic.chapter.book.name, `Chapter ${topic.chapter.name}`, topic.name],
                fields: [
                    { label: "Book", value: topic.chapter.book.name },
                    { label: "Chapter", value: String(topic.chapter.name) },
                    { label: "Topic", value: topic.name },
                    { label: "Number", value: String(topic.number) },
                ],
                viewHref: `/dashboard/topics/${topic.id}`,
            };
        }
        case "VERSES": {
            const verse = await db.verse.findFirst({
                where: { id: ref },
                include: { topic: { include: { chapter: { include: { book: true } } } } },
            });
            if (!verse) return notFoundDetails("verse");
            return {
                exists: true,
                archived: verse.archived,
                breadcrumb: [
                    verse.topic.chapter.book.name,
                    `Chapter ${verse.topic.chapter.name}`,
                    verse.topic.name,
                    `Verse ${verse.number}`,
                ],
                fields: [
                    { label: "Book", value: verse.topic.chapter.book.name },
                    { label: "Chapter", value: String(verse.topic.chapter.name) },
                    { label: "Topic", value: verse.topic.name },
                    { label: "Verse", value: String(verse.number) },
                    { label: "Text", value: snippet(verse.text) },
                ],
                viewHref: `/dashboard/verses/${verse.id}`,
            };
        }
        case "NOTES": {
            const note = await db.note.findFirst({
                where: { id: ref },
                include: {
                    user: true,
                    verse: { include: { topic: { include: { chapter: { include: { book: true } } } } } },
                },
            });
            if (!note) return notFoundDetails("note");
            return {
                exists: true,
                archived: note.archived,
                breadcrumb: [
                    note.verse.topic.chapter.book.name,
                    `Chapter ${note.verse.topic.chapter.name}`,
                    `Verse ${note.verse.number}`,
                ],
                fields: [
                    { label: "Note by", value: note.user.name },
                    { label: "Book", value: note.verse.topic.chapter.book.name },
                    { label: "Chapter", value: String(note.verse.topic.chapter.name) },
                    { label: "Verse", value: String(note.verse.number) },
                    { label: "Note", value: snippet(note.text) },
                ],
                viewHref: `/dashboard/notes/${note.id}`,
            };
        }
        case "USERS": {
            const user = await db.user.findFirst({ where: { id: ref } });
            if (!user) return notFoundDetails("user");
            return {
                exists: true,
                archived: user.archived,
                breadcrumb: [user.name],
                fields: [
                    { label: "Name", value: user.name },
                    { label: "Email", value: user.email },
                    { label: "Role", value: user.role },
                ],
                viewHref: `/dashboard/users/${user.id}`,
            };
        }
        case "BLOGS": {
            const blog = await db.blog.findFirst({ where: { id: ref }, include: { book: true, chapter: true } });
            if (!blog) return notFoundDetails("blog");
            return {
                exists: true,
                archived: blog.archived,
                breadcrumb: [blog.book.name, blog.title],
                fields: [
                    { label: "Title", value: blog.title },
                    { label: "Book", value: blog.book.name },
                    ...(blog.chapter ? [{ label: "Chapter", value: String(blog.chapter.name) }] : []),
                    { label: "Status", value: blog.status },
                ],
                viewHref: `/dashboard/blogs/${blog.id}`,
            };
        }
        case "AUTHORS": {
            const author = await db.author.findFirst({ where: { id: ref } });
            if (!author) return notFoundDetails("author");
            return {
                exists: true,
                archived: author.archived,
                breadcrumb: [author.name],
                fields: [{ label: "Name", value: author.name }],
                viewHref: `/dashboard/authors/${author.id}`,
            };
        }
        case "COMMENTARIES": {
            const commentary = await db.commentary.findFirst({
                where: { id: ref },
                include: { author: true, verse: { include: { topic: { include: { chapter: { include: { book: true } } } } } } },
            });
            if (!commentary) return notFoundDetails("commentary");
            return {
                exists: true,
                archived: commentary.archived,
                breadcrumb: [commentary.verse.topic.chapter.book.name, `Verse ${commentary.verse.number}`],
                fields: [
                    { label: "Author", value: commentary.author.name },
                    { label: "Book", value: commentary.verse.topic.chapter.book.name },
                    { label: "Verse", value: String(commentary.verse.number) },
                ],
                viewHref: `/dashboard/commentaries/${commentary.id}`,
            };
        }
        case "ABOUTCONTENT": {
            return {
                exists: true,
                archived: false,
                breadcrumb: ["About page"],
                fields: [],
                viewHref: `/dashboard/about`,
            };
        }
        case "BOOKMARKS":
        default:
            return notFoundDetails("record");
    }
}

export async function getDetails(id: number): Promise<ApiResponse<ActivityDetails>> {
    try {
        const session = await requireAdmin();
        if (isAuthError(session)) return session;
        const activity = await db.activity.findFirst({ where: { id } });
        if (!activity) {
            return { succeed: false, code: "NOT_FOUND", data: null };
        }
        const details = await resolveActivityDetails(activity);
        return { succeed: true, data: details };
    } catch (error) {
        console.log(error);
        return { succeed: false, code: "UNKNOWN_ERROR", data: null };
    }
}
