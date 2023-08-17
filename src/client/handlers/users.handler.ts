import axios from "axios";
import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import { Prisma } from "@prisma/client";
import { UserFormSchema } from "@/components/dashboard/forms/users.form";
import { IUser } from "@/shared/types/models.types";



type PaginationProps = BasePaginationProps<Prisma.UserInclude>


export async function get(
    { page = 1, perPage, include }: PaginationProps
): Promise<PaginatedApiResponse<IUser[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<IUser[]>>(
            `/api/users?page=${page}&perPage=${perPage}&include=${JSON.stringify(include)}`
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



