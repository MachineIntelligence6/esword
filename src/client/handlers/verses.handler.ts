import axios from "axios";
import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import { Prisma, Verse } from "@prisma/client";
import { VerseFormSchema } from "@/components/dashboard/forms/verses.form";

type PaginationProps = BasePaginationProps<Prisma.VerseInclude> & {
    chapter?: number;
}


export async function get(
    { page = 1, perPage, chapter = -1, include }: PaginationProps
): Promise<PaginatedApiResponse<Verse[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<Verse[]>>(
            `/api/verses?page=${page}&perPage=${perPage}&chapter=${chapter}&include=${JSON.stringify(include)}`
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



export async function create(data: VerseFormSchema): Promise<ApiResponse<Verse>> {
    try {
        const res = await axios.post<ApiResponse<Verse>>("/api/verses", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}

export async function update(id: number, update: VerseFormSchema): Promise<ApiResponse<Verse>> {
    try {
        const res = await axios.put<ApiResponse<Verse>>(`/api/verses/${id}`, update)
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
        const res = await axios.delete<ApiResponse<null>>(`/api/verses/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



