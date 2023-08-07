import { BackButton } from "@/components/buttons";
import CommentariesForm from "@/components/forms/commentaries.form";
import VersesForm from "@/components/forms/verses.form";
import apiHandlers from "@/server/handlers";



export default async function Page() {
  const { data: verses } = await apiHandlers.verses.getAll({ perPage: -1 })
  const { data: authors } = await apiHandlers.authors.getAll({ perPage: -1 })

  return (
    <div>
      <div className="flex items-center gap-5">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Add New Commentary
        </h1>
      </div>
      <div className="mt-8">
        <CommentariesForm verses={verses ?? []} authors={authors ?? []} />
      </div>
    </div>
  )
}