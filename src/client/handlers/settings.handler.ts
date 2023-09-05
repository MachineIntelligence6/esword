import axios from "axios";
import { ApiResponse } from "@/shared/types/api.types";
import { AboutContentFormSchema } from "@/components/dashboard/forms/aboutcontent.form";
import { AboutContent } from "@prisma/client";



export async function getAboutContent(): Promise<ApiResponse<AboutContent>> {
    try {
        const res = await axios.get<ApiResponse<AboutContent>>('/api/settings/aboutcontent')
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}



export async function saveAboutContent(content: AboutContentFormSchema): Promise<ApiResponse<AboutContent>> {
    try {
        const res = await axios.post<ApiResponse<AboutContent>>(`/api/settings/aboutcontent`, content)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}






