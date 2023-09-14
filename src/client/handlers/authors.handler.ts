import axios from "axios";
import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import { AuthorFormSchema } from "@/components/dashboard/forms/authors.form";
import { IAuthor } from "@/shared/types/models.types";
import { AuthorsPaginationProps } from "@/shared/types/pagination.types";



export async function get({
    page = 1, perPage, include, where, orderBy
}: AuthorsPaginationProps): Promise<PaginatedApiResponse<IAuthor[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<IAuthor[]>>(
            `/api/authors?page=${page}&perPage=${perPage}&include=${JSON.stringify(include)}&where=${JSON.stringify(where)}&orderBy=${JSON.stringify(orderBy)}`
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

export async function getById(id: number): Promise<ApiResponse<IAuthor>> {
    try {
        const res = await axios.get<ApiResponse<IAuthor>>(
            `/api/authors/${id}`
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




export async function create(data: AuthorFormSchema): Promise<ApiResponse<IAuthor>> {
    try {
        const res = await axios.post<ApiResponse<IAuthor>>("/api/authors", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}

export async function update(id: number, update: AuthorFormSchema): Promise<ApiResponse<IAuthor>> {
    try {
        const res = await axios.put<ApiResponse<IAuthor>>(`/api/authors/${id}`, update)
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
        const res = await axios.delete<ApiResponse<null>>(`/api/authors/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



