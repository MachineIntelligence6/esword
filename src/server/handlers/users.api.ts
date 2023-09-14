import { ApiResponse, BasePaginationProps, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Prisma, UserRole } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { comparePassword, getServerAuth, hashPassword } from "../auth";
import { IUser, IUserRole } from "@/shared/types/models.types";
import { UserPaginationProps } from "@/shared/types/pagination.types";


type PaginationProps = BasePaginationProps<Prisma.UserInclude> & {
    role?: IUserRole
}


export async function getAll({ page = 1, perPage = defaults.PER_PAGE_ITEMS, role = "ALL", include, where, orderBy }: UserPaginationProps): Promise<PaginatedApiResponse<IUser[]>> {
    try {
        const users = await db.user.findMany({
            where: where ? {
                ...where,
                archived: where.archived ?? false
            } : {
                archived: false,
                ...(role !== "ALL" && { role: role })
            },
            orderBy: orderBy ? orderBy : {
                id: "asc"
            },
            ...(perPage !== -1 && {
                take: perPage,
                skip: page <= 1 ? 0 : ((page - 1) * perPage),
            }),
            include: (
                include ?
                    include
                    // { ...(include.notes && { notes: { where: { archived: false } } }) }
                    : { notes: false }
            )
        })
        const usersCount = await db.user.count({
            where: where ? {
                ...where,
                archived: where.archived ?? false
            } : {
                archived: false,
                ...(role !== "ALL" && { role: role })
            },
        })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: users.length,
                totalPages: Math.ceil(usersCount / perPage),
                count: usersCount
            },
            data: users.map((user) => ({
                ...user,
                password: ""
            }))
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}



export async function getById(id: number, include?: Prisma.UserInclude): Promise<ApiResponse<IUser>> {
    try {
        const user = await db.user.findFirst({
            where: {
                id: id,
                archived: false
            },
            include: (
                include ?
                    include
                    // { ...(include.notes && { notes: { where: { archived: false } } }) }
                    : { notes: false }
            )
        })
        if (!user) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: {
                ...user,
                password: ""
            }
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}



export async function archive(id: number): Promise<ApiResponse<null>> {
    try {
        await db.user.update({
            where: { id: id },
            data: {
                archived: true,
            }
        })
        return {
            succeed: true,
            data: null
        }
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}




export async function archiveMany(ids: number[]): Promise<ApiResponse<any>> {
    try {
        let succeeded = 0;
        let failed = 0;

        for (let id of ids) {
            const res = await archive(id)
            if (res.succeed && res.data) succeeded += 1
            else failed += 1
        }

        return {
            succeed: true,
            data: {
                succeeded,
                failed
            }
        }
    } catch (error) {
        return {
            succeed: false,
            code: "UNKOWN_ERROR",
            data: null
        }
    }
}



type CreateUserReq = {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

export async function create(req: Request): Promise<ApiResponse<IUser>> {
    try {
        const userReq = await req.json() as CreateUserReq
        const userExist = await db.user.findFirst({ where: { email: userReq.email } })
        if (userExist) {
            return {
                succeed: false,
                code: "EMAIL_ALREADY_EXISTS"
            }
        }
        const password = await hashPassword(userReq.password)
        if (!password) throw new Error("");
        const user = await db.user.create({
            data: {
                name: userReq.name,
                email: userReq.email,
                password: password,
                role: userReq.role
            },
            include: {
                notes: false
            }
        })
        if (!user) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: {
                ...user,
                password: ""
            }
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}






type UpdateUserReq = {
    name?: string | null;
    email?: string | null;
    password?: string | null;
    role?: UserRole | null
}


export async function update(req: Request, id: number): Promise<ApiResponse<any>> {
    try {
        const userReq = await req.json() as UpdateUserReq
        const password = (userReq.password && userReq.password !== "") ? await hashPassword(userReq.password) : undefined
        const user = await db.user.update({
            data: {
                ...(userReq.name && { name: userReq.name }),
                ...(userReq.email && { email: userReq.email }),
                ...(password && { password: password }),
                ...(userReq.role && { role: userReq.role }),
            },
            where: {
                id: id
            }
        })
        if (!user) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: {
                ...user,
                password: ""
            }
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKOWN_ERROR"
        }
    }
}



type VerifyPasswordReq = {
    password: string
}


export async function verifyPassword(req: Request): Promise<ApiResponse<IUser>> {
    try {
        const session = await getServerAuth()
        if (typeof session === "boolean" || !session?.user) throw new Error("")
        const { password } = await req.json() as VerifyPasswordReq
        const user = await db.user.findFirst({
            where: { id: Number(session.user.id) }
        })
        if (!user) throw new Error("");
        const passwordMatch = await comparePassword(password, user.password)
        return {
            succeed: passwordMatch,
            code: passwordMatch ? "SUCCESS" : "WRONG_PASSWORD",
            ...(passwordMatch && {
                data: {
                    ...user,
                    password: ""
                }
            })
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNAUTHORIZED"
        }
    }
}
