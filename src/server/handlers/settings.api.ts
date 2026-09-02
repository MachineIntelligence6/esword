import { ApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { AboutContent } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { isAuthError, requireContentManager } from "./authz";
import { sanitizeRichHtml } from "@/lib/sanitize-html";



export async function getAboutContent(): Promise<ApiResponse<AboutContent>> {
    try {
        const aboutContent = await db.aboutContent.findFirst({
            where: {
                id: defaults.ABOUT_CONTENT_ID
            },
        })
        return {
            succeed: true,
            data: aboutContent
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKNOWN_ERROR",
            data: null
        }
    }
}




type AboutContentReq = {
    title?: string;
    content?: string;
}

export async function saveAboutContent(req: Request): Promise<ApiResponse<AboutContent>> {
    try {
        const session = await requireContentManager()
        if (isAuthError(session)) return session
        const { title, content } = await req.json() as AboutContentReq
        const aboutContent = await db.aboutContent.upsert({
            where: {
                id: defaults.ABOUT_CONTENT_ID,
            },
            create: {
                id: defaults.ABOUT_CONTENT_ID,
                title: title ?? "",
                content: sanitizeRichHtml(content ?? ""),
            },
            update: {
                title: title,
                content: content === undefined ? undefined : sanitizeRichHtml(content),
            }
        })
        if (!aboutContent) throw new Error("");
        return {
            succeed: true,
            code: "SUCCESS",
            data: aboutContent
        }
    } catch (error) {
        console.log(error)
        return {
            succeed: false,
            code: "UNKNOWN_ERROR"
        }
    }
}

