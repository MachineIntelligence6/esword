import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { ITopic } from "@/shared/types/models.types";
import { TopicsPaginationProps } from "@/shared/types/pagination.types";




export async function getAll({
    page = 1, perPage = defaults.PER_PAGE_ITEMS,
    chapter = -1, include, where, orderBy
}: TopicsPaginationProps): Promise<PaginatedApiResponse<ITopic[]>> {
    try {
        const topics = await db.topic.findMany({
            where: where ? {
                ...where,
                archived: where.archived ?? false
            } : {
                ...(chapter !== -1 && {
                    chapterId: chapter
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
                include ?
                    include
                    : {
                        chapter: false,
                        verses: false,
                    }
            )
        })
        const topicsCount = await db.topic.count({
            where: where ? {
                ...where,
                archived: where.archived ?? false
            } : {
                ...(chapter !== -1 && {
                    chapterId: chapter
                }),
                archived: false,
            },
        })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: topics.length,
                totalPages: Math.ceil(topicsCount / perPage),
                count: topicsCount,
            },
            data: topics
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



export async function getById(id: number, include?: Prisma.TopicInclude): Promise<ApiResponse<ITopic>> {
    try {
        const topic = await db.topic.findFirst({
            where: {
                id: id,
                archived: false
            },
            include: (
                include ?
                    include
                    : {
                        chapter: false,
                        verses: false,
                    }
            )
        })
        if (!topic) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: topic
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
        let topic = await db.topic.findFirst({ where: { id: id }, include: { verses: true } })
        if (topic?.verses && topic.verses.length > 0) {
            return {
                succeed: false,
                code: "DATA_LINKED",
                data: null
            }
        }
        if (!topic) throw new Error()
        await db.topic.update({
            where: { id: id },
            data: {
                archived: true,
                verses: {

                }
            }
        })
        await db.verse.updateMany({
            where: { topicId: topic.id },
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



export async function archiveMany(req: Request): Promise<ApiResponse<any>> {
    try {
        const { ids } = (await req.json() as { ids: number[] })
        if (!ids) throw new Error()
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



type CreateTopicReq = {
    name: string;
    number: number;
    chapter: number;
    book: number;
}

export async function create(req: Request): Promise<ApiResponse<ITopic>> {
    try {
        const topicReq = await req.json() as CreateTopicReq
        if (!topicReq.chapter || !topicReq.book) throw new Error();
        const topicExist = await db.topic.findFirst({
            where: {
                chapter: {
                    id: topicReq.chapter,
                    bookId: topicReq.book
                },
                number: topicReq.number
            }
        })
        if (topicExist) {
            return {
                succeed: false,
                code: "TOPIC_NUMBER_MUST_BE_UNIQUE",
            }
        }
        const chapter = await db.chapter.findFirst({ where: { id: topicReq.chapter } })
        if (!chapter) throw new Error()
        const topic = await db.topic.create({
            data: {
                number: topicReq.number,
                name: topicReq.name,
                chapterId: topicReq.chapter,
            },
            include: {
                verses: false,
                chapter: false
            }
        })
        if (!topic) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: topic
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}






type UpdateTopicReq = {
    number?: number;
    name?: string;
    chapter?: number;
    book: number;
}


export async function update(req: Request, id: number): Promise<ApiResponse<ITopic>> {
    try {
        const topicReq = await req.json() as UpdateTopicReq
        if (!topicReq.chapter || !topicReq.book) throw new Error();
        if (topicReq.number) {
            const topicExist = await db.topic.findFirst({
                where: {
                    chapter: {
                        id: topicReq.chapter,
                        bookId: topicReq.book
                    },
                    number: topicReq.number
                }
            })
            if (topicExist && topicExist.id !== id) {
                return {
                    succeed: false,
                    code: "TOPIC_NUMBER_MUST_BE_UNIQUE",
                }
            }
        }
        const topic = await db.topic.update({
            data: {
                ...(topicReq.name && { name: topicReq.name }),
                ...(topicReq.number && { number: topicReq.number }),
                ...(topicReq.chapter && { chapterId: topicReq.chapter }),
            },
            where: {
                id: id
            }
        })
        if (!topic) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: topic
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



