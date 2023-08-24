import axios from "axios";
import { ApiResponse } from "@/shared/types/api.types";
import { ArchivesActionReq } from "@/shared/types/reqs.types";




export async function restore(data: ArchivesActionReq): Promise<ApiResponse<any>> {
    try {
        const res = await axios.post<ApiResponse<any>>(`/api/archives/restore`, data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}

export async function dump(data: ArchivesActionReq): Promise<ApiResponse<any>> {
    try {
        const res = await axios.post<ApiResponse<any>>(`/api/archives/dump`, data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



