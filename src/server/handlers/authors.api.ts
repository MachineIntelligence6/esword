import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { IAuthor } from "@/shared/types/models.types";



type PaginationProps = BasePaginationProps<Prisma.AuthorInclude>


export async function getAll({ page = 1, perPage = defaults.PER_PAGE_ITEMS, include }: PaginationProps): Promise<PaginatedApiResponse<IAuthor[]>> {
    try {
        const authors = await db.author.findMany({
            where: {
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
                include ?
                    include
                    // { ...(include.commentaries && { commentaries: { where: { archived: false } } }) }
                    : { commentaries: false }
            )
        })
        const authorsCount = await db.author.count({ where: { archived: false } })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: authors.length,
                totalPages: Math.ceil(authorsCount / perPage)
            },
            data: authors
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



export async function getById(id: number, include?: Prisma.AuthorInclude): Promise<ApiResponse<IAuthor>> {
    try {
        const author = await db.author.findFirst({
            where: {
                OR: [
                    {
                        id: id
                    }
                ],
                archived: false
            },
            include: (
                include ?
                    include
                    // { ...(include.commentaries && { commentaries: { where: { archived: false } } }) }
                    : { commentaries: false }
            )
        })
        if (!author) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: author
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



export async function archive(id: number): Promise<ApiResponse<null>> {
    try {
        await db.author.update({
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





type CreateAuthorReq = {
    name: string;
    description: string;
}

export async function create(req: Request): Promise<ApiResponse<IAuthor>> {
    try {
        const authorReq = await req.json() as CreateAuthorReq
        const verse = await db.author.create({
            data: {
                name: authorReq.name,
                description: authorReq.description,
            },
            include: {
                commentaries: false
            }
        })
        if (!verse) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
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






type UpdateAuthorReq = {
    name?: string;
    description?: string;
}


export async function update(req: Request, id: number): Promise<ApiResponse> {
    try {
        const authorReq = await req.json() as UpdateAuthorReq
        console.log(authorReq)
        const author = await db.author.update({
            data: {
                ...(authorReq.name && { name: authorReq.name }),
                description: authorReq.description
            },
            where: {
                id: id
            }
        })
        if (!author) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: author
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}
