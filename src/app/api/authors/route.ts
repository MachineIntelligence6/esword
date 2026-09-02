import defaults from "@/shared/constants/defaults"
import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getSearchParams, parseIntegerParam, parseJsonParam } from "@/server/request-query"


export const GET = async (req: Request) => {
    const params = getSearchParams(req)
    const page = parseIntegerParam(params, "page", 1, { min: 1 })
    const perPage = parseIntegerParam(params, "perPage", defaults.PER_PAGE_ITEMS, { min: -1 })
    const include = parseJsonParam<Prisma.AuthorInclude>(params, "include")
    const where = parseJsonParam<Prisma.AuthorWhereInput>(params, "where")
    const orderBy = parseJsonParam<Prisma.AuthorOrderByWithRelationInput>(params, "orderBy")

    const res = await serverApiHandlers.authors.getAll({ page, perPage, include, where, orderBy })
    return NextResponse.json(res)
}


export async function POST(req: Request) {
    const res = await serverApiHandlers.authors.create(req)
    return NextResponse.json(res)
}

