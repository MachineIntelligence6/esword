import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { BlogType, Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { IBlog } from "@/shared/types/models.types";
import { BlogsPaginationProps } from "@/shared/types/pagination.types";
import { saveBlogImage } from "../files-handler";
import { isAuthError, requireAdmin, requireContentManager } from "./authz";
import { sanitizeRichHtml } from "@/lib/sanitize-html";

const safeUserSelect = { id: true, name: true, email: true, role: true, image: true } as const

const defaultBlogInclude = {
    user: { select: safeUserSelect },
    book: true,
    chapter: true,
    verse: true,
} satisfies Prisma.BlogInclude

function mergeBlogInclude(include?: Prisma.BlogInclude): Prisma.BlogInclude {
    if (!include) return defaultBlogInclude
    return {
        ...include,
        ...(include.user
            ? { user: { select: safeUserSelect } }
            : { user: { select: safeUserSelect } }),
        book: include.book ?? true,
        chapter: include.chapter ?? true,
        verse: include.verse ?? true,
    }
}

/** Build where-clause so results stay within the selected reading context. */
export function buildContextualBlogWhere(params: {
    type?: BlogType
    book?: number
    chapter?: number
    verse?: number
    user?: number
    status?: "DRAFT" | "PUBLISHED"
    where?: Prisma.BlogWhereInput
}): Prisma.BlogWhereInput {
    const { type, book, chapter, verse, user, status, where } = params

    const base: Prisma.BlogWhereInput = {
        ...(where ?? {}),
        archived: where?.archived ?? false,
        ...(type && { type }),
        ...(status && { status }),
        ...(user !== undefined && user !== -1 && { userId: user }),
    }

    if (!book || book === -1) {
        return base
    }

    base.bookId = book

    if (verse && verse !== -1) {
        base.OR = [
            { verseId: verse },
            ...(chapter && chapter !== -1
                ? [{ chapterId: chapter, verseId: null as null }]
                : []),
            { chapterId: null, verseId: null },
        ]
        return base
    }

    if (chapter && chapter !== -1) {
        base.OR = [
            { chapterId: chapter },
            { chapterId: null, verseId: null },
        ]
        return base
    }

    return base
}

function relevanceRank(blog: IBlog, chapter?: number, verse?: number): number {
    if (verse && verse !== -1 && blog.verseId === verse) return 0
    if (chapter && chapter !== -1 && blog.chapterId === chapter && !blog.verseId) return 1
    if (chapter && chapter !== -1 && blog.chapterId === chapter) return 2
    if (!blog.chapterId && !blog.verseId) return 3
    return 4
}

type LocationInput = {
    bookId: number
    chapterId?: number | null
    verseId?: number | null
}

type LocationResult =
    | { ok: true; bookId: number; chapterId: number | null; verseId: number | null }
    | { ok: false; code: "INVALID_RELATIONSHIP" | "NOT_FOUND" }

export async function resolveBlogLocation(input: LocationInput): Promise<LocationResult> {
    const book = await db.book.findFirst({
        where: { id: input.bookId, archived: false },
        select: { id: true },
    })
    if (!book) return { ok: false, code: "NOT_FOUND" }

    let chapterId = input.chapterId ?? null
    let verseId = input.verseId ?? null

    if (verseId) {
        const verse = await db.verse.findFirst({
            where: { id: verseId, archived: false },
            include: {
                topic: {
                    include: {
                        chapter: { select: { id: true, bookId: true } },
                    },
                },
            },
        })
        if (!verse?.topic?.chapter) return { ok: false, code: "INVALID_RELATIONSHIP" }
        if (verse.topic.chapter.bookId !== book.id) {
            return { ok: false, code: "INVALID_RELATIONSHIP" }
        }
        if (chapterId && verse.topic.chapter.id !== chapterId) {
            return { ok: false, code: "INVALID_RELATIONSHIP" }
        }
        chapterId = verse.topic.chapter.id
    } else if (chapterId) {
        const chapter = await db.chapter.findFirst({
            where: { id: chapterId, bookId: book.id, archived: false },
            select: { id: true },
        })
        if (!chapter) return { ok: false, code: "INVALID_RELATIONSHIP" }
    }

    return { ok: true, bookId: book.id, chapterId, verseId }
}

export async function getAll({
    page = 1, perPage = defaults.PER_PAGE_ITEMS,
    user = -1, type, book = -1, chapter = -1, verse = -1,
    include, where, orderBy
}: BlogsPaginationProps): Promise<PaginatedApiResponse<IBlog[]>> {
    try {
        const blogWhere = buildContextualBlogWhere({ type, book, chapter, verse, user, where })
        const blogs = await db.blog.findMany({
            where: blogWhere,
            orderBy: orderBy ? orderBy : {
                createdAt: "desc"
            },
            ...(perPage !== -1 && {
                take: perPage,
                skip: page <= 1 ? 0 : ((page - 1) * perPage),
            }),
            include: mergeBlogInclude(include),
        })
        const blogsCount = await db.blog.count({ where: blogWhere })

        const sorted = [...blogs].sort((a, b) => {
            const rankDiff =
                relevanceRank(a, chapter, verse) - relevanceRank(b, chapter, verse)
            if (rankDiff !== 0) return rankDiff
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })

        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: sorted.length,
                totalPages: Math.ceil(blogsCount / perPage),
                count: blogsCount,
            },
            data: sorted
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

export async function getByRef(ref: string, include?: Prisma.BlogInclude): Promise<ApiResponse<IBlog>> {
    try {
        const blog = await db.blog.findFirst({
            where: {
                OR: [
                    { slug: ref },
                    { id: parseInt(ref) }
                ],
                archived: false
            },
            include: mergeBlogInclude(include),
        })
        if (!blog) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: blog
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

export async function archive(id: number): Promise<ApiResponse<IBlog>> {
    try {
        const session = await requireAdmin()
        if (isAuthError(session)) return session
        await db.blog.update({
            where: { id: id },
            data: {
                archived: true,
            }
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

type CreateBlogReq = {
    title: string;
    slug: string;
    content: string;
    type: BlogType;
    tags: string[];
    image: string | null
    book: number
    chapter?: number | null
    verse?: number | null
}

export async function create(req: Request): Promise<ApiResponse<IBlog>> {
    try {
        const session = await requireContentManager()
        if (isAuthError(session)) return session

        const blogReq = await req.json() as CreateBlogReq
        if (!blogReq.book) {
            return { succeed: false, code: "VALIDATION_ERROR" }
        }

        const location = await resolveBlogLocation({
            bookId: blogReq.book,
            chapterId: blogReq.chapter ?? null,
            verseId: blogReq.verse ?? null,
        })
        if (!location.ok) {
            return { succeed: false, code: location.code }
        }

        const blogExist = await db.blog.findFirst({
            where: { slug: blogReq.slug }
        })
        if (blogExist) {
            return {
                succeed: false,
                code: "SLUG_MUST_BE_UNIQUE",
            }
        }
        const imagePath = (blogReq.image ? await saveBlogImage(blogReq.image) : null)
        const blog = await db.blog.create({
            data: {
                title: blogReq.title,
                slug: blogReq.slug,
                content: sanitizeRichHtml(blogReq.content),
                type: blogReq.type,
                userId: Number(session.user.id),
                image: imagePath,
                tags: blogReq.tags.join(","),
                bookId: location.bookId,
                chapterId: location.chapterId,
                verseId: location.verseId,
            },
            include: defaultBlogInclude,
        })
        if (!blog) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: blog
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}

type UpdateBlogReq = {
    title?: string;
    slug?: string;
    content?: string;
    type?: BlogType;
    tags?: string[];
    image?: string | null;
    book?: number;
    chapter?: number | null;
    verse?: number | null;
}

export async function update(req: Request, id: number): Promise<ApiResponse<IBlog>> {
    try {
        const session = await requireContentManager()
        if (isAuthError(session)) return session
        const blogReq = await req.json() as UpdateBlogReq

        const existing = await db.blog.findFirst({ where: { id, archived: false } })
        if (!existing) {
            return { succeed: false, code: "NOT_FOUND" }
        }

        if (blogReq.slug) {
            const blogExist = await db.blog.findFirst({
                where: { slug: blogReq.slug }
            })
            if (blogExist && blogExist.id !== id) {
                return {
                    succeed: false,
                    code: "SLUG_MUST_BE_UNIQUE",
                }
            }
        }

        let locationUpdate: {
            bookId?: number
            chapterId?: number | null
            verseId?: number | null
        } = {}

        const locationTouched =
            blogReq.book !== undefined ||
            blogReq.chapter !== undefined ||
            blogReq.verse !== undefined

        if (locationTouched) {
            const location = await resolveBlogLocation({
                bookId: blogReq.book ?? existing.bookId,
                chapterId:
                    blogReq.chapter !== undefined ? blogReq.chapter : existing.chapterId,
                verseId: blogReq.verse !== undefined ? blogReq.verse : existing.verseId,
            })
            if (!location.ok) {
                return { succeed: false, code: location.code }
            }
            locationUpdate = {
                bookId: location.bookId,
                chapterId: location.chapterId,
                verseId: location.verseId,
            }
        }

        const imagePath = (blogReq.image ? await saveBlogImage(blogReq.image) : null)
        const blog = await db.blog.update({
            data: {
                ...(blogReq.title && { title: blogReq.title }),
                ...(blogReq.slug && { slug: blogReq.slug }),
                ...(blogReq.content && { content: sanitizeRichHtml(blogReq.content) }),
                ...(blogReq.type && { type: blogReq.type }),
                ...(blogReq.tags && { tags: blogReq.tags.join(",") }),
                ...(blogReq.image && imagePath && { image: imagePath }),
                ...locationUpdate,
            },
            where: {
                id: id
            },
            include: defaultBlogInclude,
        })
        if (!blog) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: blog
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}
