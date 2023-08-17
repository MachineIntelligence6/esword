import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { parse as csvParse } from 'csv-parse/sync'
import { IVerse } from "@/shared/types/models.types";



type PaginationProps = BasePaginationProps<Prisma.VerseInclude> & {
    topic?: number;
}


export async function getAll({ page = 1, perPage = defaults.PER_PAGE_ITEMS, topic = -1, include }: PaginationProps): Promise<PaginatedApiResponse<IVerse[]>> {
    try {
        const verses = await db.verse.findMany({
            where: {
                ...(topic !== -1 && {
                    topicId: topic
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
                include ?
                    {
                        ...include,
                        // ...(include.notes && { notes: { where: { archived: false } } }),
                        // ...(include.commentaries && { commentaries: { where: { archived: false } } }),
                    }
                    : {
                        topic: false,
                        notes: false,
                        commentaries: false
                    }
            )
        })
        const versesCount = await db.verse.count({
            where: {
                ...(topic !== -1 && {
                    topicId: topic
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



export async function getById(id: number, include?: Prisma.VerseInclude): Promise<ApiResponse<IVerse>> {
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
            include: (
                include ?
                    {
                        ...include,
                        // ...(include.notes && { notes: { where: { archived: false } } }),
                        // ...(include.commentaries && { commentaries: { where: { archived: false } } }),
                    }
                    : {
                        topic: false,
                        notes: false,
                        commentaries: false
                    }
            )
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
    number: number;
    text: string;
    topic: number;
    chapter: number;
    book: number;
}

export async function create(req: Request): Promise<ApiResponse<IVerse>> {
    try {
        const verseReq = await req.json() as CreateVerseReq
        if (!verseReq.chapter || !verseReq.book || !verseReq.topic) throw new Error();
        const verseExist = await db.verse.findFirst({
            where: {
                topic: {
                    chapter: {
                        id: verseReq.chapter,
                        bookId: verseReq.book
                    }
                },
                number: verseReq.number
            }
        })
        if (verseExist) {
            return {
                succeed: false,
                code: "VERSE_NUMBER_MUST_BE_UNIQUE",
            }
        }
        const topic = await db.topic.findFirst({ where: { id: verseReq.topic } })
        if (!topic) throw new Error()
        const verse = await db.verse.create({
            data: {
                number: verseReq.number,
                text: verseReq.text,
                topicId: verseReq.topic,
                // slug: `${chapter.slug}_${verseReq.number}`
            },
            include: {
                notes: false,
                topic: false,
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






type UpdateVerseReq = {
    number?: number;
    text?: string;
    topic?: number;
    chapter: number;
    book: number;
}


export async function update(req: Request, id: number): Promise<ApiResponse<IVerse>> {
    try {
        const verseReq = await req.json() as UpdateVerseReq
        if (!verseReq.chapter || !verseReq.book) throw new Error();
        if (verseReq.number) {
            const verseExist = await db.verse.findFirst({
                where: {
                    id: { not: id },
                    topic: {
                        chapter: {
                            id: verseReq.chapter,
                            bookId: verseReq.book
                        }
                    },
                    number: verseReq.number
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
                ...(verseReq.number && { number: verseReq.number }),
                ...(verseReq.text && { text: verseReq.text }),
                ...(verseReq.topic && { topicId: verseReq.topic }),
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






type CsvIVerse = {
    book: string;
    chapter: number;
    topicNumber: number;
    topicName: string;
    number: number;
    text: string;
}


export async function importFromCSV(req: Request): Promise<ApiResponse<IVerse[]>> {
    try {
        const data = await req.formData()
        const blob = (data.get("file")?.valueOf() as (Blob | null))
        if (!blob) return {
            succeed: false,
            code: "FILE_NOT_FOUND"
        }
        const csvInputData = await blob.text()
        const csvRecords: any[] = csvParse(csvInputData, { delimiter: "$", from_line: 2, relaxQuotes: true })
        const csvIVerses: CsvIVerse[] = csvRecords.map((record: any[]) => ({
            book: record[0],
            chapter: Number(record[1]),
            topicNumber: record[2],
            topicName: record[3],
            number: Number(record[4]),
            text: record[5],
        }));

        const createdIVerses: IVerse[] = []

        for (let csvIVerse of csvIVerses) {
            const book = await db.book.upsert({
                where: { name: csvIVerse.book.trim() },
                create: {
                    name: csvIVerse.book,
                    abbreviation: "",
                    slug: csvIVerse.book.toLowerCase().replaceAll(" ", "_")
                },
                update: {}
            })
            const chapterSlug = `${book.slug}_${csvIVerse.chapter}`
            const chapter = await db.chapter.upsert({
                where: { slug: chapterSlug },
                create: {
                    name: csvIVerse.chapter,
                    slug: chapterSlug,
                    bookId: book.id,
                },
                update: {}
            })
            let topic = await db.topic.findFirst({
                where: {
                    name: csvIVerse.topicName,
                    number: csvIVerse.topicNumber,
                    chapter: {
                        id: chapter.id,
                        bookId: chapter.bookId
                    }
                }
            })
            if (!topic) {
                topic = await db.topic.create({
                    data: {
                        name: csvIVerse.topicName,
                        number: csvIVerse.topicNumber,
                        chapterId: chapter.id
                    }
                })
            }
            let verse = await db.verse.findFirst({
                where: {
                    topic: {
                        id: topic.id,
                        chapter: {
                            id: chapter.id,
                            bookId: chapter.bookId
                        }
                    }
                }
            })
            if (!verse) {
                verse = await db.verse.create({
                    data: {
                        number: csvIVerse.number,
                        text: csvIVerse.text,
                        topicId: chapter.id,
                    },
                })
                createdIVerses.push(verse)
            }
        }
        return {
            succeed: true,
            code: "SUCCESS",
            data: createdIVerses
        }
    } catch (error) {
        console.log(error)
    }
    return {
        succeed: false,
        code: "UNKOWN_ERROR"
    }


}