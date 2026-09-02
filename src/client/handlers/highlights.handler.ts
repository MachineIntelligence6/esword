import axios from "axios";
import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import { IHighlight } from "@/shared/types/models.types";
import { HighlightsPaginationProps } from "@/shared/types/pagination.types";
import { Prisma } from "@prisma/client";
import { buildApiQuery } from "@/client/query-string";




export async function get({
    page = 1, perPage, verse = -1, include, where, orderBy
}: HighlightsPaginationProps): Promise<PaginatedApiResponse<IHighlight[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<IHighlight[]>>(
            `/api/highlights${buildApiQuery({ page, perPage, verse, include, where, orderBy })}`
        )
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR",
            data: null
        }
    }
}
export async function getById(id: number, include: Prisma.BookmarkInclude): Promise<PaginatedApiResponse<IHighlight[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<IHighlight[]>>(
            `/api/highlights/${id}${buildApiQuery({ include })}`
        )
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR",
            data: null
        }
    }
}



export async function create(verse: number, text: string, index: number): Promise<ApiResponse<IHighlight>> {
    try {
        const res = await axios.post<ApiResponse<IHighlight>>(`/api/highlights`, { verse, text, index })
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}




export async function archive(id: number): Promise<ApiResponse<null>> {
    try {
        const res = await axios.delete<ApiResponse<null>>(`/api/highlights/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}



