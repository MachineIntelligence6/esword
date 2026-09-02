import serverApiHandlers from "@/server/handlers"
import { getSearchParams, parseIntegerParam } from "@/server/request-query"
import defaults from "@/shared/constants/defaults"
import { NextResponse } from "next/server"





export async function GET(req: Request) {
    const params = getSearchParams(req)
    const page = parseIntegerParam(params, "page", 1, { min: 1 })
    const perPage = parseIntegerParam(params, "perPage", defaults.PER_PAGE_ITEMS, { min: -1 })
    const query = (params.get("query") ?? "").trim()
    const res = await serverApiHandlers.search.findAll({ page, perPage, query })
    return NextResponse.json(res)
}


