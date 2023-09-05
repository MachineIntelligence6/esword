import { ApiResponse, PaginatedApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { Prisma } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { IActivity } from "@/shared/types/models.types";
import { ActivitesPaginationProps } from "@/shared/types/pagination.types";




export async function getAll({
    page = 1, perPage = defaults.PER_PAGE_ITEMS,
    include, where, orderBy
}: ActivitesPaginationProps): Promise<PaginatedApiResponse<IActivity[]>> {
    try {
        const activities = await db.activity.findMany({
            where: where,
            orderBy: orderBy ? orderBy : {
                timestamp: "desc"
            },
            ...(perPage !== -1 && {
                take: perPage,
                skip: page <= 1 ? 0 : ((page - 1) * perPage),
            }),
            include: include ? include : { user: true }
        })
        const activitiesCount = await db.activity.count({ where: where, })
        return {
            succeed: true,
            pagination: {
                page: page,
                perPage: perPage,
                results: activities.length,
                totalPages: Math.ceil(activitiesCount / perPage),
                count: activitiesCount,
            },
            data: activities
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



export async function getById(id: number, include?: Prisma.ActivityInclude): Promise<ApiResponse<IActivity>> {
    try {
        const activity = await db.activity.findFirst({
            where: {
                id: id
            },
            include: include ? include : { user: true }
        })
        if (!activity) {
            return {
                succeed: false,
                code: "NOT_FOUND",
                data: null
            }
        }
        return {
            succeed: true,
            data: activity
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
        await db.activity.delete({
            where: { id: id },
        })
        return {
            succeed: true,
            data: null
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



