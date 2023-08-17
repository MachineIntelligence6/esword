import { BackButton } from "@/components/dashboard/buttons";
import ChaptersTable from "@/components/dashboard/tables/chapters.table";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/dashboard/ui/card"
import { Button, buttonVariants } from "@/components/dashboard/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { cn } from "@/lib/utils";
import db from "@/server/db";
import { IBook } from "@/shared/types/models.types";


export default async function Page({ params }: { params: { id: string } }) {
    const { data: book } = await serverApiHandlers.books.getByRef(params.id)
    if (!book) return notFound()
    const next = await db.book.findFirst({
        take: 1,
        where: {
            id: {
                gt: parseInt(params.id),
            },
            archived: false
        },
        orderBy: {
            id: "asc",
        },
    });
    const previous = await db.book.findFirst({
        take: 1,
        where: {
            id: {
                lt: parseInt(params.id),
            },
            archived: false
        },
        orderBy: {
            id: "asc",
        },
    });


    return (
        <div className="space-y-8">
            <div className="flex items-center gap-5 justify-between">
                <div className="flex items-center gap-5">
                    <BackButton />
                    <h1 className="font-semibold text-2xl">
                        {book?.name}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={previous ? `/dashboard/books/${previous.id}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full",
                            !previous && "opacity-60 pointer-events-none"
                        )}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                    <Link
                        href={next ? `/dashboard/books/${next.id}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full",
                            !next && "opacity-60 pointer-events-none"
                        )}>
                        <ChevronRightIcon className="w-6 h-6" />
                    </Link>
                </div>
            </div>
            <BookDetailsCard book={book} />
            <div className="pt-5">
                <h3 className="font-semibold text-2xl mb-5">Chapters</h3>
                <ChaptersTable book={book} />
            </div>
        </div>
    )
}


function BookDetailsCard({ book }: { book: IBook }) {
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