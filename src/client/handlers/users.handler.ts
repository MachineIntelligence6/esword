import axios from "axios";
import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import { UserFormSchema } from "@/components/dashboard/forms/users.form";
import { IUser } from "@/shared/types/models.types";
import { UserPaginationProps } from "@/shared/types/pagination.types";






export async function get(
    { page = 1, perPage, role = "ALL", include, where, orderBy }: UserPaginationProps
): Promise<PaginatedApiResponse<IUser[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<IUser[]>>(
            `/api/users?page=${page}&perPage=${perPage}&role=${role}&include=${JSON.stringify(include)}&where=${JSON.stringify(where)}&orderBy=${JSON.stringify(orderBy)}`
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




export async function create(data: UserFormSchema): Promise<ApiResponse<IUser>> {
    try {
        const res = await axios.post<ApiResponse<IUser>>("/api/users", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}

export async function update(id: number, update: UserFormSchema): Promise<ApiResponse<IUser>> {
    try {
        const res = await axios.put<ApiResponse<IUser>>(`/api/users/${id}`, update)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}
export async function verifyPassword(password: string): Promise<ApiResponse<IUser>> {
    try {
        const res = await axios.post<ApiResponse<IUser>>(`/api/users/verify-password`, { password: password })
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
        const res = await axios.delete<ApiResponse<null>>(`/api/users/${id}`)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



