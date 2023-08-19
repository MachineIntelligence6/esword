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
    await prisma.note.create({
        data: {
            text: "",
            userId: 1,
            verseId: 1,
        }
    })
    // await prisma.author.create({
    //     data: {
    //         name: "Author 1",
    //         description: "some description"
    //     }
    // })
    // for (let index = 0; index < 50; index++) {
    //     await prisma.book.create({
    //         data: {
    //             name: "Book " + index,
    //             slug: "book_" + index,
    //             abbreviation: "Genesis",
    //             chapters: {
    //                 createMany: {
    //                     data: [
    //                         {
    //                             name: "1",
    //                             slug: `book_${index}_${1}`,
    //                         },
    //                         {
    //                             name: "2",
    //                             slug: `book_${index}_${2}`
    //                         },
    //                         {
    //                             name: "3",
    //                             slug: `book_${index}_${3}`
    //                         },
    //                         {
    //                             name: "4",
    //                             slug: `book_${index}_${4}`
    //                         },
    //                         {
    //                             name: "5",
    //                             slug: `book_${index}_${5}`
    //                         },
    //                         {
    //                             name: "6",
    //                             slug: `book_${index}_${6}`
    //                         },
    //                         {
    //                             name: "7",
    //                             slug: `book_${index}_${7}`
    //                         },
    //                         {
    //                             name: "8",
    //                             slug: `book_${index}_${8}`
    //                         },
    //                         {
    //                             name: "9",
    //                             slug: `book_${index}_${9}`
    //                         },
    //                         {
    //                             name: "10",
    //                             slug: `book_${index}_${10}`
    //                         },
    //                     ],
    //                 }
    //             }
    //         },
    //     })
    // }
    // (await prisma.chapter.findMany({ include: { book: true } })).forEach(async (chapter) => {
    //     for (let index = 0; index < 10; index++) {
    //         const verse = await prisma.verse.create({
    //             data: {
    //                 number: index + 1,
    //                 text: "Some text",
    //                 chapterId: chapter.id,
    //                 slug: `${chapter.slug}_${index + 1}`
    //             },
    //         })
    //         for (let index = 0; index < 10; index++) {
    //             await prisma.commentary.create({
    //                 data: {
    //                     name: "Commentary 1",
    //                     text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsa maiores nostrum eos, aliquid aperiam unde hic impedit quisquam facilis excepturi quibusdam ut saepe praesentium iste quam iure a.",
    //                     authorId: 1,
    //                     verseId: verse.id,
    //                 }
    //             })
    //         }
    //     }
    // })
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
