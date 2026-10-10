import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
    const { id } = await params
    const res = await serverApiHandlers.activities.getDetails(parseInt(id))
    return NextResponse.json(res)
}
