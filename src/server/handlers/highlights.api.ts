import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { IBookmark, IHighlight } from "@/shared/types/models.types";
import { HighlightsPaginationProps } from "@/shared/types/pagination.types";
import { getServerAuth } from "../auth";




export async function getAll({
    page = 1, perPage = defaults.PER_PAGE_ITEMS,
    verse = -1, include, where, orderBy
}: HighlightsPaginationProps): Promise<PaginatedApiResponse<IHighlight[]>> {
    try {
        const session = await getServerAuth()
        if (!session) return {
            code: "UNAUTHORIZED",
            succeed: false
        }
        const highlights = await db.highlight.findMany({
            where: where ? where : {
                ...(verse !== -1 && {
                    verseId: verse
                }),
                userId: Number(session.user.id)
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
                    include
                    : {
                        verse: {
                            include: {
                                topic: {
                                    include: {
                                        chapter: {
                                            include: {
                                                book: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        user: false,
                    }
            )
        })
        const highlightsCount = await db.highlight.count({
            where: where ? where : {
                ...(verse !== -1 && {
                    verseId: verse
                }),
                userId: Number(session.user.id)
            },
        })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: highlights.length,
                totalPages: Math.ceil(highlightsCount / perPage),
                count: highlightsCount,
            },
            data: highlights
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



export async function getById(id: number, include?: Prisma.HighlightInclude): Promise<ApiResponse<IHighlight>> {
    try {
        const session = await getServerAuth()
        if (!session) return {
            code: "UNAUTHORIZED",
            succeed: false
        }
        const highlight = await db.highlight.findFirst({
            where: {
                id: id,
                userId: Number(session.user.id)
            },
            include: (
                include ?
                    include
                    : {
                        user: false,
                        verse: {
                            include: {
                                topic: {
                                    include: {
                                        chapter: {
                                            include: {
                                                book: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                    }
            )
        })
        if (!highlight) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: highlight
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
        await db.highlight.delete({
            where: { id: id },
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





type CreateHighlightReq = {
    verse: number;
    text: string;
    index: number;
}

export async function create(req: Request): Promise<ApiResponse<IHighlight>> {
    try {
        const session = await getServerAuth()
        if (!session) return {
            code: "UNAUTHORIZED",
            succeed: false
        }
        const { verse: verseId, index, text } = await req.json() as CreateHighlightReq
        const highlightExist = await db.highlight.findFirst({
            where: {
                verseId: verseId,
                userId: Number(session.user.id)
            }
        })
        if (highlightExist) {
            return {
                succeed: false,
                code: "HIGHLIGHT_ALREADY_EXIST",
            }
        }
        const verse = await db.verse.findFirst({ where: { id: verseId } })
        if (!verse) throw new Error()
        const highlight = await db.highlight.create({
            data: {
                verseId: verseId,
                userId: Number(session.user.id),
                text: text,
                index: index
            },
            include: {
                verse: false,
                user: false
            }
        })
        if (!highlight) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: highlight
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



type UpdateHighlightsReq = {
    verse: number;
    highlights: Array<IHighlight>;
}

export async function update(req: Request): Promise<ApiResponse<null>> {
    try {
        const session = await getServerAuth()
        if (!session) return {
            code: "UNAUTHORIZED",
            succeed: false
        }
        const { verse: verseId, highlights } = await req.json() as UpdateHighlightsReq
        const verse = await db.verse.findFirst({ where: { id: verseId } })
        if (!verse) throw new Error()
        await db.highlight.deleteMany({
            where: {
                verseId: verseId,
                userId: Number(session.user.id)
            }
        })
        if (highlights?.length > 0) {
            const createdHighlights = await db.highlight.createMany({
                data: highlights.map((h) => ({
                    index: h.index,
                    text: h.text,
                    userId: Number(session.user.id),
                    verseId: verseId
                }))
            })
            console.log("Created Highlights = ", createdHighlights.count)
        }
        return {
            succeed: true,
            code: "SUCCESS",
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



