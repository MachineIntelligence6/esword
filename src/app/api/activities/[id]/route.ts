import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"




type RouteParams = { params: { id: string } }

// Get By Id
export async function GET(_req: Request, { params }: RouteParams) {
    const res = await serverApiHandlers.activities.getById(parseInt(params.id))
    return NextResponse.json(res)
}


// Delete
export async function DELETE(_req: Request, { params }: RouteParams) {
    const res = await serverApiHandlers.activities.archive(parseInt(params.id))
    return NextResponse.json(res)
}

