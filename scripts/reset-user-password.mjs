#!/usr/bin/env node
/**
 * Reset one user's password (ops / lockout recovery).
 *
 * Usage:
 *   RESET_USER_EMAIL=admin@example.com RESET_USER_PASSWORD='...' node scripts/reset-user-password.mjs
 *
 * In production, also set ALLOW_PASSWORD_RESET=true for that one command.
 */
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const email = (process.env.RESET_USER_EMAIL ?? "").trim().toLowerCase()
const password = process.env.RESET_USER_PASSWORD ?? ""
const allow =
  process.env.NODE_ENV !== "production" ||
  process.env.ALLOW_PASSWORD_RESET === "true"

if (!allow) {
  console.error(
    "Refusing password reset in production. Set ALLOW_PASSWORD_RESET=true for an intentional one-time reset."
  )
  process.exit(1)
}

if (!email || !password || password.length < 12) {
  console.error(
    "RESET_USER_EMAIL and RESET_USER_PASSWORD (min 12 characters) are required."
  )
  process.exit(1)
}

const prisma = new PrismaClient()

try {
  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.update({
    where: { email },
    data: {
      password: hash,
      archived: false,
      archivedAt: null,
    },
  })
  console.log(`Password updated for ${user.email} (id=${user.id}, role=${user.role}).`)
} catch (error) {
  console.error(error)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
