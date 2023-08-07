import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Author, Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";



type PaginationProps = BasePaginationProps<Prisma.AuthorInclude>


export async function getAll({ page = 1, perPage = defaults.PER_PAGE_ITEMS, include }: PaginationProps): Promise<PaginatedApiResponse<Author[]>> {
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
                include ? include : {
                    commentaries: false
                }
            )
        })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: authors.length
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



export async function getById(id: number, include?: Prisma.AuthorInclude): Promise<ApiResponse<Author>> {
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
            include: (include ? include : { commentaries: false })
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

export async function create(req: Request): Promise<ApiResponse<Author>> {
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






type UpdateAuthorReq = {
    name?: string | null;
    description?: string | null;
}


export async function update(req: Request, id: number): Promise<ApiResponse> {
    try {
        const verseReq = await req.json() as UpdateAuthorReq
        const verse = await db.verse.update({
            data: {
                ...(verseReq.name && { name: verseReq.name }),
                ...(verseReq.description && { description: verseReq.description })
            },
            where: {
                id: id
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
