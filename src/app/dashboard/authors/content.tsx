'use client'
import { Author } from "@prisma/client";
import { useState } from "react";
import apiClientActions from "@/client/actions";
import { useToast } from "@/components/ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link";
import AuthorsTable from "@/components/tables/authors.table";
import AuthorsForm from "@/components/forms/authors.form";




export default function PageContent({ authors }: { authors: Author[] }) {
    const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
    const { toast } = useToast();

    const handleDelete = async (author: Author) => {
        const res = await apiClientActions.authors.archive(author.id)
        if (res.succeed) {
            window.location.reload();
            // toast({
            //     title: "Author Deleted",
            //     description: definedMessages.BOOK_DELETED
            // })
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
                    <AuthorsTable
                        authors={authors}
                        viewAction={(author: Author) => (
                            <Link href={`/dashboard/authors/${author.id}`}>View</Link>
                        )}
                        editAction={(author: Author) => (
                            <span onClick={() => setSelectedAuthor(author)}>
                                Edit
                            </span>
                        )}
                        deleteAction={handleDelete} />
                }
            </div>
            <div className="col-span-4 mt-12">
                <AuthorsForm author={selectedAuthor} onReset={() => setSelectedAuthor(null)} />
            </div>
        </div>
    )
}

