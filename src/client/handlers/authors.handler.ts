import axios from "axios";
import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import { Author, Prisma } from "@prisma/client";
import { AuthorFormSchema } from "@/components/dashboard/forms/authors.form";


type PaginationProps = BasePaginationProps<Prisma.AuthorInclude>

export async function get(
    { page = 1, perPage, include }: PaginationProps
): Promise<PaginatedApiResponse<Author[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<Author[]>>(
            `/api/authors?page=${page}&perPage=${perPage}&include=${JSON.stringify(include)}`
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




export async function create(data: AuthorFormSchema): Promise<ApiResponse<Author>> {
    try {
        const res = await axios.post<ApiResponse<Author>>("/api/authors", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}

export async function update(id: number, update: AuthorFormSchema): Promise<ApiResponse<Author>> {
    try {
        const res = await axios.put<ApiResponse<Author>>(`/api/authors/${id}`, update)
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



