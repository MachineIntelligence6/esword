import axios from "axios";
import { ApiResponse } from "@/shared/types/api.types";
import { Chapter } from "@prisma/client";
import { ChapterFormSchema } from "@/components/forms/chapters.form";





export async function create(data: ChapterFormSchema): Promise<ApiResponse<Chapter>> {
    try {
        const res = await axios.post<ApiResponse<Chapter>>("/api/chapters", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}

export async function update(id: number, update: ChapterFormSchema): Promise<ApiResponse<Chapter>> {
    try {
        const res = await axios.put<ApiResponse<Chapter>>(`/api/chapters/${id}`, update)
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
        const res = await axios.delete<ApiResponse<null>>(`/api/chapters/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}




