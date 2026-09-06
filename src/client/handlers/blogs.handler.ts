import axios from "axios";
import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import { IBlog } from "@/shared/types/models.types";
import { BlogsPaginationProps } from "@/shared/types/pagination.types";
import { BlogsFormSchema } from "@/components/dashboard/forms/blogs.form";
import { buildApiQuery } from "@/client/query-string";

export async function get({
    page = 1, perPage, user = -1,
    book = -1, chapter = -1, verse = -1,
    include, where, orderBy, type
}: BlogsPaginationProps): Promise<PaginatedApiResponse<IBlog[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<IBlog[]>>(
            `/api/blogs${buildApiQuery({
                page,
                perPage,
                user,
                book,
                chapter,
                verse,
                type,
                include,
                where,
                orderBy,
            })}`
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
export async function getById(id: number): Promise<ApiResponse<IBlog>> {
    try {
        const res = await axios.get<ApiResponse<IBlog>>(
            `/api/blogs/${id}`
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

export async function create(data: BlogsFormSchema): Promise<ApiResponse<IBlog>> {
    try {
        const res = await axios.post<ApiResponse<IBlog>>("/api/blogs", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}

export async function update(id: number, update: BlogsFormSchema): Promise<ApiResponse<IBlog>> {
    try {
        const res = await axios.put<ApiResponse<IBlog>>(`/api/blogs/${id}`, update)
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
        const res = await axios.delete<ApiResponse<null>>(`/api/blogs/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}
