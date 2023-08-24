import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { ICommentary } from "@/shared/types/models.types";
import { CommentariesPaginationProps } from "@/shared/types/pagination.types";






export async function getAll({
    page = 1, perPage = defaults.PER_PAGE_ITEMS, verse = -1,
    author = -1, include, where, orderBy
}: CommentariesPaginationProps): Promise<PaginatedApiResponse<ICommentary[]>> {
    try {
        const commentaries = await db.commentary.findMany({
            where: where ?
                {
                    ...where,
                    archived: where.archived ?? false
                } : {
                    ...(author !== -1 && {
                        authorId: author
                    }),
                    ...(verse !== -1 && {
                        verseId: verse
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
                include ? include : {
                    author: false,
                    verse: false
                }
            )
        })
        const commentariesCount = await db.commentary.count({
            where: where ?
                {
                    ...where,
                    archived: where.archived ?? false
                } : {
                    ...(author !== -1 && {
                        authorId: author
                    }),
                    ...(verse !== -1 && {
                        verseId: verse
                    }),
                    archived: false,
                }
        })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: commentaries.length,
                totalPages: Math.ceil(commentariesCount / perPage),
                count: commentariesCount
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



export async function getById(id: number, include?: Prisma.CommentaryInclude): Promise<ApiResponse<ICommentary>> {
    try {
        const commentary = await db.commentary.findFirst({
            where: {
                id: id,
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




export async function archiveMany(ids: number[]): Promise<ApiResponse<any>> {
    try {
        let succeeded = 0;
        let failed = 0;

        for (let id of ids) {
            const res = await archive(id)
            if (res.succeed && res.data) succeeded += 1
            else failed += 1
        }

        return {
            succeed: true,
            data: {
                succeeded,
                failed
            }
        }
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}




type CreateICommentaryReq = {
    name: string;
    text: string;
    verse: number;
    author: number;
}

export async function create(req: Request): Promise<ApiResponse<ICommentary>> {
    try {
        const commentaryReq = await req.json() as CreateICommentaryReq
        const commentary = await db.commentary.create({
            data: {
                name: commentaryReq.name,
                text: commentaryReq.text,
                authorId: commentaryReq.author,
                verseId: commentaryReq.verse
            },
            include: {
                verse: false,
                author: false
            }
        })
        if (!commentary) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
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






type UpdateICommentaryReq = {
    name?: string | null;
    text?: string | null;
    verse?: number | null;
    author?: number | null;
}


export async function update(req: Request, id: number): Promise<ApiResponse<ICommentary>> {
    try {
        const commentaryReq = await req.json() as UpdateICommentaryReq
        const commentary = await db.commentary.update({
            data: {
                ...(commentaryReq.name && { name: commentaryReq.name }),
                ...(commentaryReq.text && { text: commentaryReq.text }),
                ...(commentaryReq.verse && { verseId: commentaryReq.verse }),
                ...(commentaryReq.author && { authorId: commentaryReq.author }),
            },
            where: {
                id: id
            }
        })
        if (!commentary) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
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
