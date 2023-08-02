import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    // await prisma.user.upsert({
    //     create: {
    //         email: "admin@gmail.com",
    //         name: "Admin",
    //         password: "12345",
    //         username: "admin"
    //     },
    //     where: {
    //         email: "admin@.gmail.com"
    //     },
    //     update: {}
    // })
    for (let index = 0; index < 50; index++) {
        await prisma.book.upsert({
            create: {
                name: "Book " + index,
                slug: "book_" + index
            },
            where: {
                slug: "book_" + index
            },
            update: {}
        })
    }
    for (let index = 0; index < 50; index++) {
        await prisma.chapter.upsert({
            create: {
                name: "Chapter " + index,
                slug: "chapter_" + index,
                abbreviation: "Genesis",
                bookId: Math.round(Math.random() * 45)
            },
            where: {
                slug: "chapter_" + index
            },
            update: {}
        })
    }
    for (let index = 0; index < 50; index++) {
        await prisma.verse.upsert({
            create: {
                name: "Verse " + index,
                slug: "geneses_" + index,
                number: index,
                text: "Some text " + index,
                chapterId: Math.round(Math.random() * 45)
            },
            where: {
                slug: "geneses_" + index
            },
            update: {}
        })
    }
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
