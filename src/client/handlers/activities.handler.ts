import axios from "axios";
import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import { IActivity } from "@/shared/types/models.types";
import { ActivitesPaginationProps } from "@/shared/types/pagination.types";
import { Prisma } from "@prisma/client";




export async function get({
    page = 1, perPage, include, where, orderBy
}: ActivitesPaginationProps): Promise<PaginatedApiResponse<IActivity[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<IActivity[]>>(
            `/api/activities?page=${page}&perPage=${perPage}&include=${JSON.stringify(include)}&where=${JSON.stringify(where)}&orderBy=${JSON.stringify(orderBy)}`
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

export async function getById(id: number, include?: Prisma.ActivityInclude): Promise<ApiResponse<IActivity>> {
    try {
        const res = await axios.get<ApiResponse<IActivity>>(
            `/api/activities/${id}?include=${include}`
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



// export async function create(data: TopicFormSchema): Promise<ApiResponse<IActivity>> {
//     try {
//         const res = await axios.post<ApiResponse<IActivity>>("/api/activities", data)
//         if (res.status !== 200) throw new Error()
//         return res.data
//     } catch (error) {
//         return {
//             succeed: false,
//             code: "UNKNOWN_ERROR"
//         }
//     }
// }

// export async function update(id: number, update: TopicFormSchema): Promise<ApiResponse<IActivity>> {
//     try {
//         const res = await axios.put<ApiResponse<IActivity>>(`/api/activities/${id}`, update)
//         if (res.status !== 200) throw new Error()
//         return res.data
//     } catch (error) {
//         return {
//             succeed: false,
//             code: "UNKNOWN_ERROR"
//         }
//     }
// }



export async function archive(id: number): Promise<ApiResponse<null>> {
    try {
        const res = await axios.delete<ApiResponse<null>>(`/api/activities/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}

export async function archiveMany(ids: number[]): Promise<ApiResponse<any>> {
    try {
        const res = await axios.delete<ApiResponse<any>>(`/api/activities?ids=${ids.join(",")}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}



