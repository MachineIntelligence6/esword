import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Book, Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";



type PaginationProps = BasePaginationProps<Prisma.BookInclude>



export async function getAll({ page = 1, perPage = defaults.PER_PAGE_ITEMS, include }: PaginationProps): Promise<PaginatedApiResponse<Book[]>> {
    try {
        const books = await db.book.findMany({
            where: {
                archived: false
            },
            orderBy: {
                id: "asc"
            },
            ...(perPage !== -1 && {
                take: perPage,
                skip: page <= 1 ? 0 : ((page - 1) * perPage),
            }),
            include: (include ? include : { chapters: false })
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
        console.error(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}


export async function getByRef(ref: string, include?: Prisma.BookInclude): Promise<ApiResponse<Book>> {
    try {
        const book = await db.book.findFirst({
            where: {
                OR: [
                    {
                        slug: ref,
                    },
                    {
                        id: parseInt(ref)
                    }
                ],
                archived: false
            },
            include: (include ? include : { chapters: false })
        })
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
        console.error(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}



export async function archive(id: number): Promise<ApiResponse<Book>> {
    try {
        await db.book.update({ where: { id: id }, data: { archived: true } })
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



type CreateBookReq = Prisma.BookCreateInput

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
            data: {
                name: bookReq.name,
                slug: bookReq.slug,
                abbreviation: bookReq.abbreviation
            },
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
        console.error(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}




type UpdateBookReq = {
    name?: string | null
    slug?: string | null
    abbreviation?: string | null
}


export async function update(req: Request, id: number): Promise<ApiResponse> {
    try {
        const bookReq = await req.json() as UpdateBookReq

        if (bookReq.slug) {
            const bookExist = await db.book.findFirst({
                where: { slug: bookReq.slug }
            })
            if (bookExist && bookExist.id !== id) {
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
                ...(bookReq.abbreviation && { abbreviation: bookReq.abbreviation }),
            },
            where: {
                id: id
            }
        })
        if (!book) throw new Error("");
        return {
            succeed: true,
            code: "SUCCEESS",
            data: book
        }
    } catch (error) {
        console.error(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}
