import serverApiHandlers from "@/server/handlers"
import { ArchivesActionReq } from "@/shared/types/reqs.types"
import { NextResponse } from "next/server"




export async function POST(req: Request) {
    const body = (await req.json()) as ArchivesActionReq
    console.log(body)
    const res = await serverApiHandlers.archives.resetore(body)
    return NextResponse.json(res)
}
