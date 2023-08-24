import { ApiResponse } from "@/shared/types/api.types";
import { ArchivesActionReq } from "@/shared/types/reqs.types";
import db from "../db";





async function restoreBooks(ids: number[]) {
    const res = await db.book.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: true
        },
        data: {
            archived: false,
        },
    })
    const chapters = await db.chapter.findMany({
        where: {
            bookId: { in: ids }
        }
    })
    await restoreChapters(chapters.map((ch) => ch.id))
    return res.count
}

async function restoreChapters(ids: number[]) {
    const res = await db.chapter.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: true
        },
        data: {
            archived: false,
        },
    })
    const topics = await db.topic.findMany({
        where: {
            chapterId: { in: ids }
        }
    })
    await restoreTopics(topics.map((t) => t.id))
    return res.count
}

async function restoreTopics(ids: number[]) {
    const res = await db.topic.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: true
        },
        data: {
            archived: false,
        },
    })
    const verses = await db.verse.findMany({
        where: {
            topicId: { in: ids }
        }
    })
    await restoreVerses(verses.map((v) => v.id))
    return res.count
}
async function restoreVerses(ids: number[]) {
    const res = await db.verse.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: true
        },
        data: {
            archived: false,
        },
    })
    const commentaries = await db.commentary.findMany({
        where: {
            verseId: { in: ids }
        }
    })
    await restoreCommentaries(commentaries.map((c) => c.id))
    return res.count
}
async function restoreAuthors(ids: number[]) {
    const res = await db.author.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: true
        },
        data: {
            archived: false,
        },
    })
    const commentaries = await db.commentary.findMany({
        where: {
            authorId: { in: ids }
        }
    })
    await restoreCommentaries(commentaries.map((c) => c.id))
    return res.count
}
async function restoreUsers(ids: number[]) {
    const res = await db.user.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: true
        },
        data: {
            archived: false,
        },
    })
    // const notes = await db.note.findMany({
    //     where: {
    //         userId: { in: ids }
    //     }
    // })
    // await restoreNotes(notes.map((c) => c.id))
    return res.count
}
async function restoreCommentaries(ids: number[]) {
    const res = await db.commentary.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: true
        },
        data: {
            archived: false,
        },
    })
    const commentaries = await db.commentary.findMany({
        where: {
            verseId: { in: ids }
        }
    })
    restoreCommentaries(commentaries.map((c) => c.id))
    return res.count
}




export async function resetore(req: ArchivesActionReq): Promise<ApiResponse<any>> {
    try {
        let succeed = 0
        if (req.model === "Book") {
            succeed = await restoreBooks(req.ids)
        }
        if (req.model === "Chapter") {
            succeed = await restoreChapters(req.ids)
        }
        if (req.model === "Verse") {
            succeed = await restoreVerses(req.ids)
        }
        if (req.model === "Commentary") {
            succeed = await restoreCommentaries(req.ids)
        }
        if (req.model === "Author") {
            succeed = await restoreAuthors(req.ids)
        }
        if (req.model === "Topic") {
            succeed = await restoreTopics(req.ids)
        }
        if (req.model === "User") {
            succeed = await restoreUsers(req.ids)
        }
        return {
            succeed: true,
            data: {
                succeed,
                failed: req.ids.length - succeed
            }
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }

}


export async function dump(req: ArchivesActionReq): Promise<ApiResponse<any>> {
    try {
        let succeed = 0
        if (req.model === "Book") {
            const res = await db.book.updateMany({
                where: {
                    id: {
                        in: req.ids
                    }
                },
                data: {
                    archived: true
                }
            })
            succeed = res.count
        }
        return {
            succeed: true,
            data: {
                succeed,
                failed: req.ids.length - succeed
            }
        }
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }

}

