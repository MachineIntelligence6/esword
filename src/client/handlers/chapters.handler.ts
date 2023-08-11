import axios from "axios";
import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import { Chapter, Prisma } from "@prisma/client";
import { ChapterFormSchema } from "@/components/dashboard/forms/chapters.form";

type PaginationProps = BasePaginationProps<Prisma.ChapterInclude> & {
    book?: number;
}


export async function get(
    { page = 1, perPage, book = -1, include }: PaginationProps
): Promise<PaginatedApiResponse<Chapter[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<Chapter[]>>(
            `/api/chapters?page=${page}&perPage=${perPage}&book=${book}&include=${JSON.stringify(include)}`
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



export async function create(data: ChapterFormSchema): Promise<ApiResponse<Chapter>> {
    try {
        const res = await axios.post<ApiResponse<Chapter>>("/api/chapters", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}

export async function update(id: number, update: ChapterFormSchema): Promise<ApiResponse<Chapter>> {
    try {
        const res = await axios.put<ApiResponse<Chapter>>(`/api/chapters/${id}`, update)
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
        const res = await axios.delete<ApiResponse<null>>(`/api/chapters/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}




