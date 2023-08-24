import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { IBookmark } from "@/shared/types/models.types";
import { BookmarksPaginationProps } from "@/shared/types/pagination.types";
import { getServerAuth } from "../auth";




export async function getAll({
    page = 1, perPage = defaults.PER_PAGE_ITEMS,
    verse = -1, include, where, orderBy
}: BookmarksPaginationProps): Promise<PaginatedApiResponse<IBookmark[]>> {
    try {
        const session = await getServerAuth()
        if (!session) return {
            code: "UNAUTHORIZED",
            succeed: false
        }
        const bookmarks = await db.bookmark.findMany({
            where: where ? where : {
                ...(verse !== -1 && {
                    verseId: verse
                }),
                userId: Number(session.user.id)
            },
            orderBy: orderBy ? orderBy : {
                createdAt: "desc"
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
        const bookmarksCount = await db.bookmark.count({
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
                results: bookmarks.length,
                totalPages: Math.ceil(bookmarksCount / perPage),
                count: bookmarksCount,
            },
            data: bookmarks
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



export async function getById(id: number, include?: Prisma.BookmarkInclude): Promise<ApiResponse<IBookmark>> {
    try {
        const session = await getServerAuth()
        if (!session) return {
            code: "UNAUTHORIZED",
            succeed: false
        }
        const bookmark = await db.bookmark.findFirst({
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
        if (!bookmark) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: bookmark
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
        await db.bookmark.delete({
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





type CreateBookmarkReq = {
    verse: number;
}

export async function create(req: Request): Promise<ApiResponse<IBookmark>> {
    try {
        const session = await getServerAuth()
        if (!session) return {
            code: "UNAUTHORIZED",
            succeed: false
        }
        const { verse: verseId } = await req.json() as CreateBookmarkReq
        const bookmarkExist = await db.bookmark.findFirst({
            where: {
                verseId: verseId,
                userId: Number(session.user.id)
            }
        })
        if (bookmarkExist) {
            return {
                succeed: false,
                code: "BOOKMARK_ALREADY_EXIST",
            }
        }
        const verse = await db.verse.findFirst({ where: { id: verseId } })
        if (!verse) throw new Error()
        const bookmark = await db.bookmark.create({
            data: {
                verseId: verseId,
                userId: Number(session.user.id)
            },
            include: {
                verse: false,
                user: false
            }
        })
        if (!bookmark) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: bookmark
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



