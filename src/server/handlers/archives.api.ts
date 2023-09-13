import { ApiResponse } from "@/shared/types/api.types";
import { ArchivesActionReq } from "@/shared/types/reqs.types";
import db from "../db";




// Restore Archived Data Start 
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
    const notes = await db.note.findMany({
        where: {
            userId: { in: ids }
        }
    })
    await restoreNotes(notes.map((c) => c.id))
    return res.count
}
async function restoreNotes(ids: number[]) {
    const res = await db.note.updateMany({
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
    return res.count
}
async function restoreBlogs(ids: number[]) {
    const res = await db.blog.updateMany({
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
        if (req.model === "Blog") {
            succeed = await restoreBlogs(req.ids)
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
// Restore Archived Data End 



// Delete Permanentally Archived Data Start 
async function deleteBooks(ids: number[]) {
    const res = await db.book.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    })
    const chapters = await db.chapter.findMany({
        where: {
            bookId: { in: ids }
        }
    })
    await deleteChapters(chapters.map((ch) => ch.id))
    return res.count
}

async function deleteChapters(ids: number[]) {
    const res = await db.chapter.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    })
    const topics = await db.topic.findMany({
        where: {
            chapterId: { in: ids }
        }
    })
    await deleteTopics(topics.map((t) => t.id))
    return res.count
}

async function deleteTopics(ids: number[]) {
    const res = await db.topic.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    })
    const verses = await db.verse.findMany({
        where: {
            topicId: { in: ids }
        }
    })
    await deleteVerses(verses.map((v) => v.id))
    return res.count
}
async function deleteVerses(ids: number[]) {
    const res = await db.verse.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    })
    const commentaries = await db.commentary.findMany({
        where: {
            verseId: { in: ids }
        }
    })
    await deleteCommentaries(commentaries.map((c) => c.id))
    return res.count
}
async function deleteAuthors(ids: number[]) {
    const res = await db.author.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    })
    const commentaries = await db.commentary.findMany({
        where: {
            authorId: { in: ids }
        }
    })
    await deleteCommentaries(commentaries.map((c) => c.id))
    return res.count
}
async function deleteUsers(ids: number[]) {
    const res = await db.user.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    })
    const notes = await db.note.findMany({
        where: {
            userId: { in: ids }
        }
    })
    await deleteNotes(notes.map((c) => c.id))
    return res.count
}
async function deleteNotes(ids: number[]) {
    const res = await db.note.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    })
    return res.count
}
async function deleteCommentaries(ids: number[]) {
    const res = await db.commentary.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    })
    return res.count
}
async function deleteBlogs(ids: number[]) {
    const res = await db.blog.deleteMany({
        where: {
            id: {
                in: ids,
            },
        },
    })
    return res.count
}



export async function permanentDelete(req: ArchivesActionReq): Promise<ApiResponse<any>> {
    try {
        let succeed = 0
        if (req.model === "Book") {
            succeed = await deleteBooks(req.ids)
        }
        if (req.model === "Chapter") {
            succeed = await deleteChapters(req.ids)
        }
        if (req.model === "Verse") {
            succeed = await deleteVerses(req.ids)
        }
        if (req.model === "Commentary") {
            succeed = await deleteCommentaries(req.ids)
        }
        if (req.model === "Author") {
            succeed = await deleteAuthors(req.ids)
        }
        if (req.model === "Topic") {
            succeed = await deleteTopics(req.ids)
        }
        if (req.model === "User") {
            succeed = await deleteUsers(req.ids)
        }
        if (req.model === "Blog") {
            succeed = await deleteBlogs(req.ids)
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

// Delete Permanentally Archived Data End 







// Add Data To Archive Start
async function addBooks(ids: number[]) {
    const res = await db.book.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: false
        },
        data: {
            archived: true
        }
    })
    const chapters = await db.chapter.findMany({
        where: {
            bookId: { in: ids }
        }
    })
    await addChapters(chapters.map((ch) => ch.id))
    return res.count
}

async function addChapters(ids: number[]) {
    const res = await db.chapter.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: false
        },
        data: {
            archived: true
        }
    })
    const topics = await db.topic.findMany({
        where: {
            chapterId: { in: ids }
        }
    })
    await addTopics(topics.map((t) => t.id))
    return res.count
}

async function addTopics(ids: number[]) {
    const res = await db.topic.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: false
        },
        data: {
            archived: true
        }
    })
    const verses = await db.verse.findMany({
        where: {
            topicId: { in: ids }
        }
    })
    await addVerses(verses.map((v) => v.id))
    return res.count
}
async function addVerses(ids: number[]) {
    const res = await db.verse.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: false
        },
        data: {
            archived: true
        }
    })
    const commentaries = await db.commentary.findMany({
        where: {
            verseId: { in: ids }
        }
    })
    await addCommentaries(commentaries.map((c) => c.id))
    return res.count
}
async function addAuthors(ids: number[]) {
    const res = await db.author.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: false
        },
        data: {
            archived: true
        }
    })
    const commentaries = await db.commentary.findMany({
        where: {
            authorId: { in: ids }
        }
    })
    await addCommentaries(commentaries.map((c) => c.id))
    return res.count
}
async function addUsers(ids: number[]) {
    const res = await db.user.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: false
        },
        data: {
            archived: true
        }
    })
    const notes = await db.note.findMany({
        where: {
            userId: { in: ids }
        }
    })
    await addNotes(notes.map((c) => c.id))
    return res.count
}
async function addNotes(ids: number[]) {
    const res = await db.note.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: false
        },
        data: {
            archived: true
        }
    })
    return res.count
}
async function addCommentaries(ids: number[]) {
    const res = await db.commentary.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: false
        },
        data: {
            archived: true
        }
    })
    return res.count
}
async function addBlogs(ids: number[]) {
    const res = await db.blog.updateMany({
        where: {
            id: {
                in: ids,
            },
            archived: false
        },
        data: {
            archived: true
        }
    })
    return res.count
}



export async function addToArchive(req: ArchivesActionReq): Promise<ApiResponse<any>> {
    try {
        let succeed = 0
        if (req.model === "Book") {
            succeed = await addBooks(req.ids)
        }
        if (req.model === "Chapter") {
            succeed = await addChapters(req.ids)
        }
        if (req.model === "Verse") {
            succeed = await addVerses(req.ids)
        }
        if (req.model === "Commentary") {
            succeed = await addCommentaries(req.ids)
        }
        if (req.model === "Author") {
            succeed = await addAuthors(req.ids)
        }
        if (req.model === "Topic") {
            succeed = await addTopics(req.ids)
        }
        if (req.model === "User") {
            succeed = await addUsers(req.ids)
        }
        if (req.model === "Blog") {
            succeed = await addBlogs(req.ids)
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

// Add Data To Archive End 
