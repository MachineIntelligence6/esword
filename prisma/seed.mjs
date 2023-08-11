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
            email: "admin@.gmail.com"
        },
        update: {}
    })
    for (let index = 0; index < 50; index++) {
        await prisma.book.create({
            data: {
                name: "Book " + index,
                slug: "book_" + index,
                abbreviation: "Genesis",
                chapters: {
                    createMany: {
                        data: [
                            {
                                name: "Chapter 1",
                                number: 1,
                                slug: "chapter_1" + index,
                            },
                            {
                                name: "Chapter 2",
                                number: 2,
                                slug: "chapter_2" + index
                            },
                            {
                                name: "Chapter 3",
                                number: 3,
                                slug: "chapter_3" + index
                            },
                            {
                                name: "Chapter 4",
                                number: 4,
                                slug: "chapter_4" + index
                            },
                            {
                                name: "Chapter 5",
                                number: 5,
                                slug: "chapter_5" + index
                            },
                            {
                                name: "Chapter 6",
                                number: 6,
                                slug: "chapter_6" + index
                            },
                            {
                                name: "Chapter 7",
                                number: 7,
                                slug: "chapter_7" + index
                            },
                            {
                                name: "Chapter 8",
                                number: 8,
                                slug: "chapter_8" + index
                            },
                            {
                                name: "Chapter 9",
                                number: 9,
                                slug: "chapter_9" + index
                            },
                            {
                                name: "Chapter 10",
                                number: 10,
                                slug: "chapter_10" + index
                            },
                        ],
                    }
                }
            },
        })
    }
    (await prisma.chapter.findMany({ include: { book: true } })).forEach(async (chapter) => {
        for (let index = 0; index < 10; index++) {
            const verse = await prisma.verse.create({
                data: {
                    name: `Verse ${index + 1}`,
                    number: index + 1,
                    text: "Some text",
                    chapterId: chapter.id
                },
            })
            for (let index = 0; index < 10; index++) {
                await prisma.commentary.create({
                    data: {
                        name: "Commentary 1",
                        text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsa maiores nostrum eos, aliquid aperiam unde hic impedit quisquam facilis excepturi quibusdam ut saepe praesentium iste quam iure a.",
                        authorId: 1,
                        verseId: verse.id
                    }
                })
            }
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
