import { Book, Chapter } from "@prisma/client"

export type ChapterWBook = Chapter & {
    book: Book
}
