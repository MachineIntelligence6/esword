import { NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import db from "@/server/db"
import { hashPassword } from "@/server/auth"
import { ApiResponse } from "@/shared/types/api.types"

type ResetPasswordBody = {
    email?: string
    password?: string
    recoverySecret?: string
}

function normalizeEmail(email: string) {
    return email.trim().toLowerCase()
}

function secretsMatch(provided: string, expected: string) {
    const a = Buffer.from(provided)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
}

export async function POST(req: Request) {
    try {
        const expectedSecret = process.env.ACCOUNT_RECOVERY_SECRET
        if (!expectedSecret || expectedSecret.length < 16) {
            const res: ApiResponse<null> = {
                succeed: false,
                code: "UNKNOWN_ERROR",
            }
            return NextResponse.json(res, { status: 503 })
        }

        const body = (await req.json()) as ResetPasswordBody
        const email = normalizeEmail(body.email ?? "")
        const password = body.password ?? ""
        const recoverySecret = (body.recoverySecret ?? "").trim()

        if (!email || !password || password.length < 8 || !recoverySecret) {
            const res: ApiResponse<null> = {
                succeed: false,
                code: "VALIDATION_ERROR",
            }
            return NextResponse.json(res)
        }

        if (!secretsMatch(recoverySecret, expectedSecret)) {
            // Same generic failure as a missing account to avoid leaking config state.
            const res: ApiResponse<null> = {
                succeed: false,
                code: "INVALID_CREDENTIALS",
            }
            return NextResponse.json(res)
        }

        const user = await db.user.findFirst({
            where: {
                email,
                archived: false,
            },
        })
        if (!user) {
            const res: ApiResponse<null> = {
                succeed: false,
                code: "INVALID_CREDENTIALS",
            }
            return NextResponse.json(res)
        }

        const hashed = await hashPassword(password)
        if (!hashed) {
            const res: ApiResponse<null> = {
                succeed: false,
                code: "UNKNOWN_ERROR",
            }
            return NextResponse.json(res)
        }

        await db.user.update({
            where: { id: user.id },
            data: { password: hashed },
        })

        const res: ApiResponse<null> = {
            succeed: true,
            code: "SUCCESS",
            data: null,
        }
        return NextResponse.json(res)
    } catch (error) {
        console.error("reset-password failed", error)
        const res: ApiResponse<null> = {
            succeed: false,
            code: "UNKNOWN_ERROR",
        }
        return NextResponse.json(res)
    }
}
