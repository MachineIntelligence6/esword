import defaults from "@/shared/constants/defaults"
import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"
import { BlogType, Prisma } from "@prisma/client"
import { getSearchParams, parseIntegerParam, parseJsonParam } from "@/server/request-query"


export const GET = async (req: Request) => {
    const params = getSearchParams(req)
    const page = parseIntegerParam(params, "page", 1, { min: 1 })
    const perPage = parseIntegerParam(params, "perPage", defaults.PER_PAGE_ITEMS, { min: -1 })
    const user = parseIntegerParam(params, "user", -1, { min: -1 })
    const type = (params.get("type") as BlogType | undefined)
    const include = parseJsonParam<Prisma.BlogInclude>(params, "include")
    const where = parseJsonParam<Prisma.BlogWhereInput>(params, "where")
    const orderBy = parseJsonParam<Prisma.BlogOrderByWithRelationInput>(params, "orderBy")

    const res = await serverApiHandlers.blogs.getAll({ page, perPage, user, include, where, orderBy, type })
    return NextResponse.json(res)
}


export async function POST(req: Request) {
    const res = await serverApiHandlers.blogs.create(req)
    return NextResponse.json(res)
}

