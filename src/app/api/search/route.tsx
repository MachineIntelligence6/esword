import serverApiHandlers from "@/server/handlers"
import defaults from "@/shared/constants/defaults"
import { NextResponse } from "next/server"





export async function GET(req: Request) {
    const params = new URLSearchParams(req.url.split("?")[1])
    const page = parseInt(params.get("page") ?? "1")
    const perPage = parseInt(params.get("perPage") ?? `${defaults.PER_PAGE_ITEMS}`)
    const query = (params.get("query") ?? "").trim()
    const res = await serverApiHandlers.search.findAll({ page, perPage, query })
    return NextResponse.json(res)
}


