import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Chapter } from "@prisma/client";
import defaults from "@/const/defaults";




export async function getAll(page = 1, perPage = defaults.PER_PAGE_ITEMS, book = -1): Promise<PaginatedApiResponse<Chapter[]>> {
    try {
        const chapters = await db.chapter.findMany({
            where: {
                ...(book !== -1 && {
                    bookId: book
                })
            },
            orderBy: {
                id: "asc"
            },
            skip: page <= 1 ? 0 : ((page - 1) * perPage),
            take: perPage,
            include: {
                book: false,
                verses: false
            }
        })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: chapters.length
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



export async function getBySlug(slug: string): Promise<ApiResponse<Chapter>> {
    try {
        const chapter = await db.chapter.findFirst({ where: { slug: slug } })
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




type CreateChapterReq = {
    name: string;
    slug: string;
    abbreviation: string;
    bookId: number;
}

export async function create(req: Request): Promise<ApiResponse> {
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
        const chapter = await db.chapter.create({
            data: chapterReq,
            include: {
                verses: false,
                book: false
            }
        })
        if (!chapter) throw new Error("");
        return {
            succeed: true,
            code: "SUCCEESS",
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
    name?: string | null
    slug?: string | null
    abbreviation?: string | null
    bookId?: number | null
}


export async function update(req: Request, slug: string): Promise<ApiResponse> {
    try {
        const chapterReq = await req.json() as UpdateChapterReq

        if (chapterReq.slug) {
            const chapterExist = await db.chapter.findFirst({
                where: { slug: chapterReq.slug }
            })
            if (chapterExist) {
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
                ...(chapterReq.abbreviation && { abbreviation: chapterReq.abbreviation }),
                ...(chapterReq.bookId && { bookId: chapterReq.bookId }),
            },
            where: {
                slug: slug
            }
        })
        if (!chapter) throw new Error("");
        return {
            succeed: true,
            code: "SUCCEESS",
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
