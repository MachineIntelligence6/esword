import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"




type RouteParams = { params: Promise<{ id: string }> }

// Get By Id
export async function GET(_req: Request, { params }: RouteParams) {
    const { id } = await params
    const res = await serverApiHandlers.activities.getById(parseInt(id))
    return NextResponse.json(res)
}


// Delete
export async function DELETE(_req: Request, { params }: RouteParams) {
    const { id } = await params
    const res = await serverApiHandlers.activities.archive(parseInt(id))
    return NextResponse.json(res)
}

