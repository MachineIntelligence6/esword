import serverApiHandlers from "@/server/handlers";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const res = await serverApiHandlers.books.reorder(req);
  return NextResponse.json(res);
}
