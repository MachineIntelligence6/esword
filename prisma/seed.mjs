import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import bcrypt from 'bcryptjs'

async function main() {
    await prisma.user.upsert({
        create: {
            email: "admin@gmail.com",
            name: "Admin",
            password: await bcrypt.hash("12345678", 10),
            role: "ADMIN"
        },
        where: {
            email: "admin@gmail.com"
        },
        update: {}
    })
    await prisma.user.upsert({
        create: {
            email: "editor@gmail.com",
            name: "Editor",
            password: await bcrypt.hash("12345678", 10),
            role: "EDITOR"
        },
        where: {
            email: "editor@gmail.com"
        },
        update: {}
    })
    await prisma.user.upsert({
        create: {
            email: "reader@gmail.com",
            name: "Reader",
            password: await bcrypt.hash("12345678", 10),
            role: "VIEWER"
        },
        where: {
            email: "reader@gmail.com"
        },
        update: {}
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
