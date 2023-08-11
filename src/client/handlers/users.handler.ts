import axios from "axios";
import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import { Prisma, User, Verse } from "@prisma/client";
import { UserFormSchema } from "@/components/dashboard/forms/users.form";



type PaginationProps = BasePaginationProps<Prisma.UserInclude>


export async function get(
    { page = 1, perPage, include }: PaginationProps
): Promise<PaginatedApiResponse<User[]>> {
    try {
        const res = await axios.get<PaginatedApiResponse<User[]>>(
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




export async function create(data: UserFormSchema): Promise<ApiResponse<User>> {
    try {
        const res = await axios.post<ApiResponse<User>>("/api/users", data)
        if (res.status !== 200) throw new Error()
        return res.data
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}

export async function update(id: number, update: UserFormSchema): Promise<ApiResponse<User>> {
    try {
        const res = await axios.put<ApiResponse<User>>(`/api/users/${id}`, update)
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



