import serverApiHandlers from "@/server/handlers";
import { isBookExportFormat } from "@/lib/book-export";
import { NextResponse } from "next/server";

type RouteParams = { params: Promise<{ ref: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  const { ref } = await params;
  const formatParam =
    new URL(req.url).searchParams.get("format")?.trim().toLowerCase() ??
    "remedies";

  if (!isBookExportFormat(formatParam)) {
    return NextResponse.json(
      { succeed: false, code: "VALIDATION_ERROR", data: null },
      { status: 400 }
    );
  }

  const res = await serverApiHandlers.books.exportByRef(ref, formatParam);
  if (!res.succeed) {
    const status =
      res.code === "UNAUTHORIZED" ? 401 : res.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json(
      { succeed: false, code: res.code, data: null },
      { status }
    );
  }

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type": res.mimeType,
      "Content-Disposition": `attachment; filename="${res.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
