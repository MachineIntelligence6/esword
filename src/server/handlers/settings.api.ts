import { ApiResponse } from "@/shared/types/api.types";
import db from '@/server/db'
import { AboutContent } from "@prisma/client";
import defaults from "@/shared/constants/defaults";
import { DonationSettings } from "@prisma/client";
import { isAuthError, requireAdmin, requireContentManager } from "./authz";
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



const TEXT_DEFAULTS = {
    message: "Thank you for supporting Hidden Sword and this work of making the writings freely available.",
    paypalUrl: "",
    popupMessage: "Help us keep the writings freely available.",
}
const stripUndefined = <T extends object>(o: T) =>
    Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as { [K in keyof T]?: Exclude<T[K], undefined> }

export async function getDonationSettings(): Promise<ApiResponse<DonationSettings>> {
    try {
        // Row 1 is created on first read, so column defaults seed the editor.
        const settings = await db.donationSettings.upsert({
            where: { id: 1 },
            create: { id: 1, ...TEXT_DEFAULTS },
            update: {},
        })
        return { succeed: true, data: settings }
    } catch (error) {
        console.error(error)
        return { succeed: false, code: "UNKNOWN_ERROR", data: null }
    }
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : undefined)
const num = (v: unknown, min: number, max: number) => {
    const n = Number(v)
    return Number.isFinite(n) && n >= min && n <= max ? n : undefined
}

export async function saveDonationSettings(req: Request): Promise<ApiResponse<DonationSettings>> {
    try {
        const session = await requireAdmin()
        if (isAuthError(session)) return session
        const b = await req.json() as Record<string, unknown>
        const paypalUrl = str(b.paypalUrl, 2000)
        if (paypalUrl && !/^https:\/\//i.test(paypalUrl)) {
            return { succeed: false, code: "VALIDATION_ERROR", data: null }
        }
        const data = {
            pageTitle: str(b.pageTitle, 100),
            heading: str(b.heading, 100),
            orgName: str(b.orgName, 100),
            message: str(b.message, 2000),
            currency: str(b.currency, 3)?.toUpperCase(),
            suggestedAmount: num(b.suggestedAmount, 0, 100000),
            buttonLabel: str(b.buttonLabel, 60),
            paypalUrl,
            monthlyOption: typeof b.monthlyOption === "boolean" ? b.monthlyOption : undefined,
            popupEnabled: typeof b.popupEnabled === "boolean" ? b.popupEnabled : undefined,
            popupTitle: str(b.popupTitle, 100),
            popupMessage: str(b.popupMessage, 1000),
            popupAmount: num(b.popupAmount, 0, 100000),
            popupButtonLabel: str(b.popupButtonLabel, 60),
            popupDelaySeconds: num(b.popupDelaySeconds, 0, 600),
            popupFrequencyDays: num(b.popupFrequencyDays, 0, 365),
        }
        const saved = await db.donationSettings.upsert({
            where: { id: 1 },
            create: { id: 1, ...TEXT_DEFAULTS, ...stripUndefined(data) },
            update: data,
        })
        return { succeed: true, code: "SUCCESS", data: saved }
    } catch (error) {
        console.error(error)
        return { succeed: false, code: "UNKNOWN_ERROR", data: null }
    }
}
