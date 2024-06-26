import axios from "axios";
import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import { ITopic } from "@/shared/types/models.types";
import { TopicFormSchema } from "@/components/dashboard/forms/topics.form";
import { TopicsPaginationProps } from "@/shared/types/pagination.types";




export async function get({
    page = 1, perPage, chapter = -1, include, where, orderBy
}: TopicsPaginationProps): Promise<PaginatedApiResponse<ITopic[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<ITopic[]>>(
            `/api/topics?page=${page}&perPage=${perPage}&chapter=${chapter}&include=${JSON.stringify(include)}&where=${JSON.stringify(where)}&orderBy=${JSON.stringify(orderBy)}`
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



export async function create(data: TopicFormSchema): Promise<ApiResponse<ITopic>> {
    try {
        const res = await axios.post<ApiResponse<ITopic>>("/api/topics", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}

export async function update(id: number, update: TopicFormSchema): Promise<ApiResponse<ITopic>> {
    try {
        const res = await axios.put<ApiResponse<ITopic>>(`/api/topics/${id}`, update)
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
        const res = await axios.delete<ApiResponse<null>>(`/api/topics/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}



