import axios from "axios";
import { ApiResponse } from "@/shared/types/api.types";
import { Book } from "@prisma/client";
import { BookFormSchema } from "@/components/forms/books.form";





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



