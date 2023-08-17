import axios from "axios";
import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import { Prisma } from "@prisma/client";
import { AuthorFormSchema } from "@/components/dashboard/forms/authors.form";
import { CommentaryFormSchema } from "@/components/dashboard/forms/commentaries.form";
import defaults from "@/shared/constants/defaults";
import { ICommentary } from "@/shared/types/models.types";



type PaginationProps = BasePaginationProps<Prisma.CommentaryInclude> & {
    author?: number;
    verse?: number;
}


export async function get(
    { page = 1, perPage = defaults.PER_PAGE_ITEMS, author = -1, verse = -1, include }: PaginationProps
): Promise<PaginatedApiResponse<ICommentary[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<ICommentary[]>>(
            `/api/commentaries?page=${page}&perPage=${perPage}&author=${author}&verse=${verse}&include=${JSON.stringify(include)}`
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

export async function update(id: number, update: CommentaryFormSchema): Promise<ApiResponse<ICommentary>> {
    try {
        const res = await axios.put<ApiResponse<ICommentary>>(`/api/commentaries/${id}`, update)
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
        const res = await axios.delete<ApiResponse<null>>(`/api/commentaries/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



