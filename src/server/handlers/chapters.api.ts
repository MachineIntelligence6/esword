import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { IChapter } from "@/shared/types/models.types";
import { ChaptersPaginationProps } from "@/shared/types/pagination.types";





export async function getAll({
    page = 1, perPage = defaults.PER_PAGE_ITEMS,
    book = -1, include, where, orderBy
}: ChaptersPaginationProps): Promise<PaginatedApiResponse<IChapter[]>> {
    try {
        const chapters = await db.chapter.findMany({
            where: where ? {
                ...where,
                archived: where.archived ?? false
            } : {
                ...(book !== -1 && {
                    bookId: book
                }),
                archived: false,
            },
            orderBy: orderBy ? orderBy : {
                id: "asc"
            },
            ...(perPage !== -1 && {
                take: perPage,
                skip: page <= 1 ? 0 : ((page - 1) * perPage),
            }),
            include: (
                include ?
                    {
                        ...include,
                        // ...(include.verses && { verses: { where: { archived: false } } })
                    }
                    : {
                        book: false,
                        topics: false
                    }
            )
        })
        const chaptersCount = await db.chapter.count({
            where: {
                ...(book !== -1 && {
                    bookId: book
                }),
                archived: false,
            },
        })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: chapters.length,
                totalPages: Math.ceil(chaptersCount / perPage),
                count: chaptersCount,
            },
            data: chapters
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}



export async function getByRef(ref: string, include?: Prisma.ChapterInclude): Promise<ApiResponse<IChapter>> {
    try {
        const chapter = await db.chapter.findFirst({
            where: {
                OR: [
                    {
                        slug: ref
                    },
                    {
                        id: parseInt(ref)
                    }
                ],
                archived: false
            },
            include: (
                include ?
                    {
                        ...include,
                        // ...(include.verses && { verses: { where: { archived: false } } })
                    }
                    : {
                        book: false,
                        topics: false
                    }
            )
        })
        if (!chapter) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: chapter
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}





export async function archive(id: number): Promise<ApiResponse<IChapter>> {
    try {
        const chapter = await db.chapter.findFirst({ where: { id: id }, include: { topics: true } })
        if (chapter?.topics && chapter.topics.length > 0) {
            return {
                succeed: false,
                code: "DATA_LINKED",
                data: null
            }
        }
        await db.chapter.update({
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
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}




type CreateChapterReq = {
    name: number;
    slug: string;
    book: number;
}

export async function create(req: Request): Promise<ApiResponse<IChapter>> {
    try {
        const chapterReq = await req.json() as CreateChapterReq
        const chapterExist = await db.chapter.findFirst({
            where: { slug: chapterReq.slug }
        })
        if (chapterExist) {
            return {
                succeed: false,
                code: "SLUG_MUST_BE_UNIQUE",
            }
        }
        const book = await db.book.findFirst({ where: { id: chapterReq.book }, include: { chapters: false } })
        if (!book) throw new Error("")
        const chapter = await db.chapter.create({
            data: {
                name: chapterReq.name,
                slug: chapterReq.slug,
                bookId: chapterReq.book,
            },
            include: {
                topics: false,
                book: false
            }
        })
        if (!chapter) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: chapter
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}






type UpdateChapterReq = {
    name?: number
    slug?: string
    book?: number
}


export async function update(req: Request, id: number): Promise<ApiResponse<IChapter>> {
    try {
        const chapterReq = await req.json() as UpdateChapterReq
        if (chapterReq.slug) {
            const chapterExist = await db.chapter.findFirst({
                where: { slug: chapterReq.slug }
            })
            if (chapterExist && chapterExist.id !== id) {
                return {
                    succeed: false,
                    code: "SLUG_MUST_BE_UNIQUE",
                }
            }
        }
        const chapter = await db.chapter.update({
            data: {
                ...(chapterReq.name && { name: chapterReq.name }),
                ...(chapterReq.slug && { slug: chapterReq.slug }),
                ...(chapterReq.book && { bookId: chapterReq.book }),
            },
            where: {
                id: id
            }
        })
        if (!chapter) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: chapter
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}
