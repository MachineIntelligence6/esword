import axios from "axios";
import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import { CommentaryFormSchema } from "@/components/dashboard/forms/commentaries.form";
import defaults from "@/shared/constants/defaults";
import { ICommentary, INote } from "@/shared/types/models.types";
import { Prisma } from "@prisma/client";
import { NotesPaginationProps } from "@/shared/types/pagination.types";


export async function get({
    page = 1, perPage = defaults.PER_PAGE_ITEMS,
    user = -1, verse = -1, include, where, orderBy
}: NotesPaginationProps): Promise<PaginatedApiResponse<INote[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<INote[]>>(
            `/api/notes?page=${page}&perPage=${perPage}&user=${user}&verse=${verse}&include=${JSON.stringify(include)}&where=${JSON.stringify(where)}&orderBy=${JSON.stringify(orderBy)}`
        )
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}





export async function create(data: CommentaryFormSchema): Promise<ApiResponse<ICommentary>> {
    try {
        const res = await axios.post<ApiResponse<ICommentary>>("/api/commentaries", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}

export async function update(id: number, text: string): Promise<ApiResponse<INote>> {
    try {
        const res = await axios.put<ApiResponse<INote>>(`/api/notes/${id}`, { text: text })
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}


export async function archive(id: number): Promise<ApiResponse<null>> {
    try {
        const res = await axios.delete<ApiResponse<null>>(`/api/notes/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



