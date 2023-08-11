import { BackButton } from "@/components/dashboard/buttons";
import CommentariesForm from "@/components/dashboard/forms/commentaries.form";
import VersesForm from "@/components/dashboard/forms/verses.form";
import serverApiHandlers from "@/server/handlers";



export default async function Page() {
  const { data: books } = await serverApiHandlers.books.getAll({ perPage: -1, include: { chapters: { include: { verses: true } } } })
  const { data: authors } = await serverApiHandlers.authors.getAll({ perPage: -1 })

  return (
    <div>
      <div className="flex items-center gap-5">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Add New Commentary
        </h1>
      </div>
      <div className="mt-8">
        <CommentariesForm books={books ?? []} authors={authors ?? []} />
      </div>
    </div>
  )
}