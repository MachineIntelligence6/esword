import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Prisma, Verse, VerseType } from "@prisma/client";
import defaults from "@/shared/constants/defaults";



type PaginationProps = BasePaginationProps<Prisma.VerseInclude> & {
    chapter?: number;
}


export async function getAll({ page = 1, perPage = defaults.PER_PAGE_ITEMS, chapter = -1, include }: PaginationProps): Promise<PaginatedApiResponse<Verse[]>> {
    try {
        const verses = await db.verse.findMany({
            where: {
                ...(chapter !== -1 && {
                    chapterId: chapter
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
                    chapter: false,
                    notes: false
                }
            )
        })
        const versesCount = await db.verse.count({
            where: {
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
                results: verses.length,
                totalPages: Math.ceil(versesCount / perPage)
            },
            data: verses
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



export async function getById(id: number, include?: Prisma.VerseInclude): Promise<ApiResponse<Verse>> {
    try {
        const verse = await db.verse.findFirst({
            where: {
                OR: [
                    {
                        id: id
                    }
                ],
                archived: false
            },
            include: (include ? include : { chapter: false, notes: false })
        })
        if (!verse) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: verse
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
        await db.verse.update({
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





type CreateVerseReq = {
    name: string;
    text: string;
    number: number;
    type: VerseType;
    chapterId: number;
}

export async function create(req: Request): Promise<ApiResponse<Verse>> {
    try {
        const verseReq = await req.json() as CreateVerseReq
        const verseExist = await db.verse.findFirst({
            where: {
                AND: [
                    { chapterId: verseReq.chapterId },
                    { number: verseReq.number },
                ]
            }
        })
        if (verseExist) {
            return {
                succeed: false,
                code: "SLUG_MUST_BE_UNIQUE",
            }
        }
        const verse = await db.verse.create({
            data: {
                name: verseReq.name,
                number: verseReq.number,
                type: verseReq.type,
                text: verseReq.text,
                chapterId: verseReq.chapterId
            },
            include: {
                notes: false,
                chapter: false
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






type UpdateVerseReq = {
    name?: string | null;
    type?: VerseType | null;
    number?: number | null;
    text?: string | null;
    chapter?: number | null;
}


export async function update(req: Request, id: number): Promise<ApiResponse<Verse>> {
    try {
        const verseReq = await req.json() as UpdateVerseReq
        if (verseReq.number && verseReq.chapter) {
            const verseExist = await db.verse.findFirst({
                where: {
                    AND: [
                        { chapterId: verseReq.chapter },
                        { number: verseReq.number },
                    ]
                }
            })
            if (verseExist && verseExist.id !== id) {
                return {
                    succeed: false,
                    code: "VERSE_NUMBER_MUST_BE_UNIQUE",
                }
            }
        }
        const verse = await db.verse.update({
            data: {
                ...(verseReq.name && { name: verseReq.name }),
                ...(verseReq.type && { type: verseReq.type }),
                ...(verseReq.text && { text: verseReq.text }),
                ...(verseReq.chapter && { chapterId: verseReq.chapter }),
                ...(verseReq.number && { number: verseReq.number }),
            },
            where: {
                id: id
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
