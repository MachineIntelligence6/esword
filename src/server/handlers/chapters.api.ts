import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Chapter, Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";



type PaginationProps = BasePaginationProps<Prisma.ChapterInclude> & {
    book?: number;
}


export async function getAll({ page = 1, perPage = defaults.PER_PAGE_ITEMS, book = -1, include }: PaginationProps): Promise<PaginatedApiResponse<Chapter[]>> {
    try {
        const chapters = await db.chapter.findMany({
            where: {
                ...(book !== -1 && {
                    bookId: book
                }),
                archived: false,
            },
            orderBy: {
                id: "asc"
            },
            ...(perPage !== -1 && {
                take: perPage,
                skip: page <= 1 ? 0 : ((page - 1) * perPage),
            }),
            include: (
                include ? include : {
                    book: false,
                    verses: false
                }
            )
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



export async function getByRef(ref: string, include?: Prisma.ChapterInclude): Promise<ApiResponse<Chapter>> {
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
            include: (include ? include : { book: false, verses: false })
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





export async function archive(id: number): Promise<ApiResponse<Chapter>> {
    try {
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
    name: string;
    slug: string;
    bookId: number;
    number: number;
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
        // const book = await db.book.findFirst({ where: { id: chapterReq.bookId }, include: { chapters: false } })
        // if (!book) throw new Error("")
        const chapter = await db.chapter.create({
            data: {
                name: chapterReq.name,
                slug: chapterReq.slug,
                bookId: chapterReq.bookId,
                number: chapterReq.number
            },
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
    bookId?: number | null
}


export async function update(req: Request, id: number): Promise<ApiResponse> {
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
                ...(chapterReq.bookId && { bookId: chapterReq.bookId }),
            },
            where: {
                id: id
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
