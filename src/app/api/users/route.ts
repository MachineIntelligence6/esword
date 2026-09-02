import defaults from "@/shared/constants/defaults"
import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"
import { IUserRole } from "@/shared/types/models.types"
import { Prisma } from "@prisma/client"
import { getSearchParams, parseIntegerParam, parseJsonParam } from "@/server/request-query"


export const GET = async (req: Request) => {
    const params = getSearchParams(req)
    const page = parseIntegerParam(params, "page", 1, { min: 1 })
    const role = (params.get("role") ?? "ALL") as IUserRole
    const perPage = parseIntegerParam(params, "perPage", defaults.PER_PAGE_ITEMS, { min: -1 })
    const include = parseJsonParam<Prisma.UserInclude>(params, "include")
    const where = parseJsonParam<Prisma.UserWhereInput>(params, "where")
    const orderBy = parseJsonParam<Prisma.UserOrderByWithRelationInput>(params, "orderBy")

    const res = await serverApiHandlers.users.getAll({ page, perPage, role, include, where, orderBy })
    return NextResponse.json(res)
}

export async function POST(req: Request) {
    const res = await serverApiHandlers.users.create(req)
    return NextResponse.json(res)
}


