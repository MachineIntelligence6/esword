import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Commentary, Prisma, Verse } from "@prisma/client";
import defaults from "@/shared/constants/defaults";



type PaginationProps = BasePaginationProps<Prisma.CommentaryInclude> & {
    author?: number;
    verse?: number;
}


export async function getAll({ page = 1, perPage = defaults.PER_PAGE_ITEMS, verse = -1, author = -1, include }: PaginationProps): Promise<PaginatedApiResponse<Commentary[]>> {
    try {
        const commentaries = await db.commentary.findMany({
            where: {
                ...(author !== -1 && {
                    authorId: author
                }),
                ...(verse !== -1 && {
                    verseId: verse
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
                    author: false,
                    verse: false
                }
            )
        })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: commentaries.length
            },
            data: commentaries
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



export async function getById(id: number, include?: Prisma.CommentaryInclude): Promise<ApiResponse<Commentary>> {
    try {
        const commentary = await db.commentary.findFirst({
            where: {
                OR: [
                    {
                        id: id
                    }
                ],
                archived: false
            },
            include: (include ? include : { author: false, verse: false })
        })
        if (!commentary) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: commentary
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
        await db.commentary.update({
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





type CreateCommentaryReq = {
    name: string;
    text: string;
    verseId: number;
    authorId: number;
}

export async function create(req: Request): Promise<ApiResponse<Commentary>> {
    try {
        const commentaryReq = await req.json() as CreateCommentaryReq
        const commentary = await db.commentary.create({
            data: {
                name: commentaryReq.name,
                text: commentaryReq.text,
                authorId: commentaryReq.authorId,
                verseId: commentaryReq.verseId
            },
            include: {
                verse: false,
                author: false
            }
        })
        if (!commentary) throw new Error("");
        return {
            succeed: true,
            code: "SUCCEESS",
            data: commentary
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}






type UpdateCommentaryReq = {
    name?: string | null;
    text?: string | null;
    verseId?: number | null;
    authorId?: number | null;
}


export async function update(req: Request, id: number): Promise<ApiResponse<Commentary>> {
    try {
        const commentaryReq = await req.json() as UpdateCommentaryReq
        const commentary = await db.commentary.update({
            data: {
                ...(commentaryReq.name && { name: commentaryReq.name }),
                ...(commentaryReq.text && { text: commentaryReq.text }),
                ...(commentaryReq.verseId && { verseId: commentaryReq.verseId }),
                ...(commentaryReq.authorId && { authorId: commentaryReq.authorId }),
            },
            where: {
                id: id
            }
        })
        if (!commentary) throw new Error("");
        return {
            succeed: true,
            code: "SUCCEESS",
            data: commentary
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}
