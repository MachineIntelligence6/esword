import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Book, Prisma } from "@prisma/client";
import defaults from "@/const/defaults";





export async function getAll(page: number = 1, perPage: number = defaults.PER_PAGE_ITEMS): Promise<PaginatedApiResponse<Book[]>> {
    try {
        const books = await db.book.findMany({
            orderBy: {
                id: "asc"
            },
            ...(perPage !== -1 && {
                take: perPage,
                skip: page <= 1 ? 0 : ((page - 1) * perPage),
            }),
            include: {
                chapters: false,
            }
        })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: books.length
            },
            data: books
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


export async function getBySlug(slug: string): Promise<ApiResponse<Book>> {
    try {
        const book = await db.book.findFirst({ where: { slug: slug } })
        if (!book) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: book
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



type CreateBookReq = {
    name: string;
    slug: string;
}

export async function create(req: Request): Promise<ApiResponse> {
    try {
        const bookReq = await req.json() as CreateBookReq
        // const slug = bookReq.slug ? bookReq.slug : bookReq.name.toLowerCase().replaceAll(" ", "_")
        const bookExist = await db.book.findFirst({
            where: { slug: bookReq.slug }
        })
        if (bookExist) {
            return {
                succeed: false,
                code: "SLUG_MUST_BE_UNIQUE",
            }
        }
        const book = await db.book.create({
            data: bookReq,
            include: {
                chapters: false
            }
        })
        if (!book) throw new Error("");
        return {
            succeed: true,
            code: "SUCCEESS",
            data: book
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}




type UpdateBookReq = {
    name?: string | null
    slug?: string | null
}


export async function update(req: Request, slug: string): Promise<ApiResponse> {
    try {
        const bookReq = await req.json() as UpdateBookReq

        if (bookReq.slug) {
            const bookExist = await db.book.findFirst({
                where: { slug: bookReq.slug }
            })
            if (bookExist) {
                return {
                    succeed: false,
                    code: "SLUG_MUST_BE_UNIQUE",
                }
            }
        }
        const book = await db.book.update({
            data: {
                ...(bookReq.name && { name: bookReq.name }),
                ...(bookReq.slug && { slug: bookReq.slug }),
            },
            where: {
                slug: slug
            }
        })
        if (!book) throw new Error("");
        return {
            succeed: true,
            code: "SUCCEESS",
            data: book
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}
