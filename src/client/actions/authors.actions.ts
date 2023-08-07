import axios from "axios";
import { ApiResponse } from "@/shared/types/api.types";
import { Verse } from "@prisma/client";
import { AuthorFormSchema } from "@/components/forms/authors.form";





export async function create(data: AuthorFormSchema): Promise<ApiResponse<Verse>> {
    try {
        const res = await axios.post<ApiResponse<Verse>>("/api/authors", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}

export async function update(id: number, update: AuthorFormSchema): Promise<ApiResponse<Verse>> {
    try {
        const res = await axios.put<ApiResponse<Verse>>(`/api/authors/${id}`, update)
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



