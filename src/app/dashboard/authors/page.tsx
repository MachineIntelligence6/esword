'use client'
import { useState } from "react";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/dashboard/ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link";
import AuthorsTable from "@/components/dashboard/tables/authors.table";
import AuthorsForm from "@/components/dashboard/forms/authors.form";
import { IAuthor } from "@/shared/types/models.types";




export default function Page() {
  const [selectedAuthor, setSelectedAuthor] = useState<IAuthor | null>(null);
  const { toast } = useToast();

  const handleDelete = async (author: IAuthor) => {
    const res = await clientApiHandlers.authors.archive(author.id)
    if (res.succeed) {
      window.location.reload();
    } else if (res.code === "DATA_LINKED") {
      toast({
        title: "Author can not be deleted.",
        variant: "destructive",
        description: "All commentaries linked with this author must be unlinked in order to delete this authtor."
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
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-2xl">
          Authors
        </h1>
      </div>
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-8 w-full">
          {
            <AuthorsTable
              viewAction={(author: IAuthor) => (
                <Link href={`/dashboard/authors/${author.id}`}>View</Link>
              )}
              editAction={(author: IAuthor) => (
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
      </div>    </div>
  )
}