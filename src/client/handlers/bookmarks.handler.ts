import axios from "axios";
import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import { IBookmark } from "@/shared/types/models.types";
import { BookmarksPaginationProps } from "@/shared/types/pagination.types";
import { Prisma } from "@prisma/client";
import { buildApiQuery } from "@/client/query-string";




export async function get({
    page = 1, perPage, verse = -1, include, where, orderBy
}: BookmarksPaginationProps): Promise<PaginatedApiResponse<IBookmark[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<IBookmark[]>>(
            `/api/bookmarks${buildApiQuery({ page, perPage, verse, include, where, orderBy })}`
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
export async function getById(id: number, include: Prisma.BookmarkInclude): Promise<PaginatedApiResponse<IBookmark[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<IBookmark[]>>(
            `/api/bookmarks/${id}${buildApiQuery({ include })}`
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



export async function create(verse: number): Promise<ApiResponse<IBookmark>> {
    try {
        const res = await axios.post<ApiResponse<IBookmark>>("/api/bookmarks", { verse })
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
        const res = await axios.delete<ApiResponse<null>>(`/api/bookmarks/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}



