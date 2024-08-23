import defaults from "@/shared/constants/defaults"
import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"
import { IUserRole } from "@/shared/types/models.types"
import { Prisma } from "@prisma/client"


export const GET = async (req: Request) => {
    console.log("test API")
    const params = new URLSearchParams(req.url.split("?")[1])
    const page = parseInt(params.get("page") ?? "1")
    const role = (params.get("role") ?? "ALL") as IUserRole
    const perPage = parseInt(params.get("perPage") ?? `${defaults.PER_PAGE_ITEMS}`)
    const includeStr = params.get("include")
    let include: Prisma.UserInclude | undefined;
    try {
        include = JSON.parse(includeStr ?? "")
    } catch (error) {
    }
    const whereStr = params.get("where")
    let where: Prisma.UserWhereInput | undefined;
    try {
        where = JSON.parse(whereStr ?? "")
    } catch (error) {
    }
    const orderByStr = params.get("orderBy")
    let orderBy: Prisma.UserOrderByWithRelationInput | undefined;
    try {
        orderBy = JSON.parse(orderByStr ?? "")
    } catch (error) {
    }

    const res = await serverApiHandlers.users.getAll({ page, perPage, role, include, where, orderBy })
    return NextResponse.json(res)
}

export async function POST(req: Request) {
    console.log("req ", req)
    const res = await serverApiHandlers.users.create(req)
    return NextResponse.json(res)
}


