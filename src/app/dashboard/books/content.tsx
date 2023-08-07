'use client'
import BooksTable from "@/components/tables/books.table";
import BooksForm from "../../../components/forms/books.form";
import { Book } from "@prisma/client";
import { useState } from "react";
import apiClientActions from "@/client/actions";
import { useToast } from "@/components/ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link";




export default function PageContent({ books }: { books: Book[] }) {
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const { toast } = useToast();

    const handleDelete = async (book: Book) => {
        const res = await apiClientActions.books.archive(book.id)
        if (res.succeed) {
            toast({
                title: "Book Deleted",
                description: definedMessages.BOOK_DELETED
            })
        } else {
            toast({
                title: "Error",
                variant: "destructive",
                description: definedMessages.UNKNOWN_ERROR
            })
        }
    }

    return (
        <div className="grid grid-cols-12 gap-10">
            <div className="col-span-8 w-full">
                {
                    <BooksTable
                        books={books}
                        viewAction={(book) => (
                            <Link href={`/dashboard/books/${book.id}`}>View</Link>
                        )}
                        editAction={(book) => (
                            <span onClick={() => setSelectedBook(book)}>
                                Edit
                            </span>
                        )}
                        deleteAction={handleDelete} />
                }
            </div>
            <div className="col-span-4 mt-12">
                <BooksForm book={selectedBook} onReset={() => setSelectedBook(null)} />
            </div>
        </div>
    )
}

