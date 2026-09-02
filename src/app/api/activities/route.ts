import defaults from "@/shared/constants/defaults"
import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getSearchParams, parseIdListParam, parseIntegerParam, parseJsonParam } from "@/server/request-query"


export const GET = async (req: Request) => {
    const params = getSearchParams(req)
    const page = parseIntegerParam(params, "page", 1, { min: 1 })
    const perPage = parseIntegerParam(params, "perPage", defaults.PER_PAGE_ITEMS, { min: -1 })
    const include = parseJsonParam<Prisma.ActivityInclude>(params, "include")
    const where = parseJsonParam<Prisma.ActivityWhereInput>(params, "where")
    const orderBy = parseJsonParam<Prisma.ActivityOrderByWithRelationInput>(params, "orderBy")

    const res = await serverApiHandlers.activities.getAll({ page, perPage, include, where, orderBy })
    return NextResponse.json(res)
}




export async function DELETE(req: Request) {
    const params = getSearchParams(req)
    const ids = parseIdListParam(params, "ids")
    const res = await serverApiHandlers.activities.archiveMany(ids)
    return NextResponse.json(res)
}