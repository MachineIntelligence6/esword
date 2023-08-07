import axios from "axios";
import { ApiResponse } from "@/shared/types/api.types";
import { Commentary, Verse } from "@prisma/client";
import { AuthorFormSchema } from "@/components/forms/authors.form";
import { CommentaryFormSchema } from "@/components/forms/commentaries.form";





export async function create(data: CommentaryFormSchema): Promise<ApiResponse<Commentary>> {
    try {
        const res = await axios.post<ApiResponse<Commentary>>("/api/commentaries", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}

export async function update(id: number, update: CommentaryFormSchema): Promise<ApiResponse<Commentary>> {
    try {
        const res = await axios.put<ApiResponse<Commentary>>(`/api/commentaries/${id}`, update)
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
        const res = await axios.delete<ApiResponse<null>>(`/api/commentaries/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



