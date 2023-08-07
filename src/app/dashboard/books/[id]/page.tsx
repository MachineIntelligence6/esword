import { BackButton } from "@/components/buttons";
import ChaptersTable from "@/components/tables/chapters.table";
import apiHandlers from "@/server/handlers";
import { ChapterWBook } from "@/shared/types/models.types";
import { Book, Chapter } from "@prisma/client";
import { notFound } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


export default async function Page({ params }: { params: { id: string } }) {
    const { data: book } = await apiHandlers.books.getByRef(params.id, { chapters: true })
    if (!book) return notFound()
    const chapters: ChapterWBook[] = (book as (Book & { chapters: Chapter[] })).chapters.map((chapter) => ({ ...chapter, book: book }))

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-5">
                <BackButton />
                <h1 className="font-semibold text-2xl">
                    {book?.name}
                </h1>
            </div>
            <BookDetailsCard book={book} />
            <div className="pt-5">
                <h3 className="font-semibold text-2xl mb-5">Chapters</h3>
                {chapters && <ChaptersTable chapters={chapters} />}
            </div>
        </div>
    )
}


function BookDetailsCard({ book }: { book: Book }) {
    return (
        <Card className="w-fit">
            <CardHeader>
                <CardTitle className="text-xl">Book Details</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between gap-20">
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Name:</span>
                    <span className="font-semibold">{book.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Slug:</span>
                    <span className="font-semibold">{book.slug}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Abbreviation:</span>
                    <span className="font-semibold">{book.abbreviation}</span>
                </div>
            </CardContent>
        </Card>
    )
}