import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import defaults from "@/shared/constants/defaults";
import { Prisma } from "@prisma/client";
import { INote } from "@/shared/types/models.types";



type PaginationProps = BasePaginationProps<Prisma.NoteInclude> & {
    user?: number;
    verse?: number;
}


export async function getAll({ page = 1, perPage = defaults.PER_PAGE_ITEMS, verse = -1, user = -1, include }: PaginationProps): Promise<PaginatedApiResponse<INote[]>> {
    try {
        const notes = await db.note.findMany({
            where: {
                ...(user !== -1 && {
                    userId: user
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
                    user: false,
                    verse: false
                }
            )
        })
        const notesCount = await db.note.count({
            where: {
                ...(user !== -1 && {
                    userId: user
                }),
                ...(verse !== -1 && {
                    verseId: verse
                }),
                archived: false,
            },
        })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: notes.length,
                totalPages: Math.ceil(notesCount / perPage)
            },
            data: notes
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



export async function getById(id: number, include?: Prisma.NoteInclude): Promise<ApiResponse<INote>> {
    try {
        const note = await db.note.findFirst({
            where: {
                id: id,
                archived: false
            },
            include: (include ? include : { user: false, verse: false })
        })
        if (!note) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: note
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
        await db.note.update({
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





type CreateNoteReq = {
    text: string;
    verse: number;
    user: number;
}

export async function create(req: Request): Promise<ApiResponse<INote>> {
    try {
        const noteReq = await req.json() as CreateNoteReq
        const note = await db.note.create({
            data: {
                text: noteReq.text,
                userId: noteReq.user,
                verseId: noteReq.verse
            },
            include: {
                verse: false,
                user: false
            }
        })
        if (!note) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: note
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}






type UpdateNoteReq = {
    text?: string | null;
    verse?: number | null;
    user?: number | null;
}


export async function update(req: Request, id: number): Promise<ApiResponse<INote>> {
    try {
        const noteReq = await req.json() as UpdateNoteReq
        const note = await db.note.update({
            data: {
                ...(noteReq.text && { text: noteReq.text }),
                ...(noteReq.verse && { verseId: noteReq.verse }),
                ...(noteReq.user && { userId: noteReq.user }),
            },
            where: {
                id: id
            }
        })
        if (!note) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: note
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}
