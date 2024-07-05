import serverApiHandlers from "@/server/handlers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const res = await serverApiHandlers.verses.importFromCSV(req);
  return NextResponse.json(res);
}
