import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import bcrypt from 'bcryptjs'

async function main() {
    const adminEmail = process.env.SEED_ADMIN_EMAIL
    const adminPassword = process.env.SEED_ADMIN_PASSWORD
    const adminName = process.env.SEED_ADMIN_NAME ?? "Admin"

    if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
        throw new Error("Refusing to run seed in production. Set ALLOW_PRODUCTION_SEED=true for an intentional one-time bootstrap.")
    }

    if (!adminEmail && !adminPassword) {
        console.log("Skipping admin seed. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to bootstrap an admin user.")
        return
    }

    if (!adminEmail || !adminPassword || adminPassword.length < 12) {
        throw new Error("SEED_ADMIN_EMAIL and a SEED_ADMIN_PASSWORD of at least 12 characters are required.")
    }

    await prisma.user.upsert({
        create: {
            email: adminEmail,
            name: adminName,
            password: await bcrypt.hash(adminPassword, 12),
            role: "ADMIN"
        },
        where: {
            email: adminEmail
        },
        update: {
            name: adminName,
            password: await bcrypt.hash(adminPassword, 12),
            role: "ADMIN",
            archived: false,
            archivedAt: null,
        }
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
