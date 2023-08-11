import axios from "axios";
import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import { Book, Prisma } from "@prisma/client";
import { BookFormSchema } from "@/components/dashboard/forms/books.form";






export async function get(
    { page = 1, perPage, include }: BasePaginationProps<Prisma.BookInclude>
): Promise<PaginatedApiResponse<Book[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<Book[]>>(
            `/api/books?page=${page}&perPage=${perPage}&include=${JSON.stringify(include)}`
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



export async function create(data: BookFormSchema): Promise<ApiResponse<Book>> {
    try {
        const res = await axios.post<ApiResponse<Book>>("/api/books", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}

export async function update(id: number, update: BookFormSchema): Promise<ApiResponse<Book>> {
    try {
        const res = await axios.put<ApiResponse<Book>>(`/api/books/${id}`, update)
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
        const res = await axios.delete<ApiResponse<null>>(`/api/books/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



