import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Chapter, Verse } from "@prisma/client";
import defaults from "@/const/defaults";




export async function getAll(page = 1, perPage = defaults.PER_PAGE_ITEMS, chapter = -1): Promise<PaginatedApiResponse<Verse[]>> {
    try {
        const verses = await db.verse.findMany({
            where: {
                ...(chapter !== -1 && {
                    chapterId: chapter
                })
            },
            orderBy: {
                id: "asc"
            },
            skip: page <= 1 ? 0 : ((page - 1) * perPage),
            take: perPage,
            include: {
                chapter: false,
                notes: false
            }
        })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: verses.length
            },
            data: verses
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



export async function getBySlug(slug: string): Promise<ApiResponse<Verse>> {
    try {
        const verse = await db.verse.findFirst({ where: { slug: slug } })
        if (!verse) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: verse
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




type CreateVerseReq = {
    name: string;
    slug: string;
    number: number;
    text: string;
    chapterId: number;
}

export async function create(req: Request): Promise<ApiResponse> {
    try {
        const verseReq = await req.json() as CreateVerseReq
        const verseExist = await db.verse.findFirst({
            where: { slug: verseReq.slug }
        })
        if (verseExist) {
            return {
                succeed: false,
                code: "SLUG_MUST_BE_UNIQUE",
            }
        }
        const verse = await db.verse.create({
            data: verseReq,
            include: {
                notes: false,
                chapter: false
            }
        })
        if (!verse) throw new Error("");
        return {
            succeed: true,
            code: "SUCCEESS",
            data: verse
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}






type UpdateVerseReq = {
    name?: string | null;
    slug?: string | null;
    number?: number | null;
    text?: string | null;
    chapterId?: number | null;
}


export async function update(req: Request, slug: string): Promise<ApiResponse> {
    try {
        const verseReq = await req.json() as UpdateVerseReq
        if (verseReq.slug) {
            const verseExist = await db.verse.findFirst({
                where: { slug: verseReq.slug }
            })
            if (verseExist) {
                return {
                    succeed: false,
                    code: "SLUG_MUST_BE_UNIQUE",
                }
            }
        }
        const verse = await db.verse.update({
            data: {
                ...(verseReq.name && { name: verseReq.name }),
                ...(verseReq.slug && { slug: verseReq.slug }),
                ...(verseReq.text && { text: verseReq.text }),
                ...(verseReq.chapterId && { chapterId: verseReq.chapterId }),
                ...(verseReq.number && { number: verseReq.number }),
            },
            where: {
                slug: slug
            }
        })
        if (!verse) throw new Error("");
        return {
            succeed: true,
            code: "SUCCEESS",
            data: verse
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}
