import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
    const res = await serverApiHandlers.settings.getDonationSettings()
    return NextResponse.json(res)
}

export async function PUT(req: Request) {
    const res = await serverApiHandlers.settings.saveDonationSettings(req)
    return NextResponse.json(res)
}
