import axios from "axios";
import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import { IBookmark } from "@/shared/types/models.types";
import { BookmarksPaginationProps } from "@/shared/types/pagination.types";
import { Prisma } from "@prisma/client";




export async function get({
    page = 1, perPage, verse = -1, include, where, orderBy
}: BookmarksPaginationProps): Promise<PaginatedApiResponse<IBookmark[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<IBookmark[]>>(
            `/api/bookmarks?page=${page}&perPage=${perPage}&verse=${verse}&include=${JSON.stringify(include)}&where=${JSON.stringify(where)}&orderBy=${JSON.stringify(orderBy)}`
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
export async function getById(id: number, include: Prisma.BookmarkInclude): Promise<PaginatedApiResponse<IBookmark[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<IBookmark[]>>(
            `/api/bookmarks/${id}?include=${JSON.stringify(include)}`
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



export async function create(verse: number): Promise<ApiResponse<IBookmark>> {
    try {
        const res = await axios.post<ApiResponse<IBookmark>>("/api/bookmarks", { verse })
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
        const res = await axios.delete<ApiResponse<null>>(`/api/bookmarks/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



