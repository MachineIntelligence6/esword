import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"






export async function GET(req: Request) {
    const res = await serverApiHandlers.settings.getAboutContent()
    return NextResponse.json(res)
}

// Update
export async function POST(req: Request) {
    const res = await serverApiHandlers.settings.saveAboutContent(req)
    return NextResponse.json(res)
}
