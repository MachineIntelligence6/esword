import { BackButton } from "@/components/buttons";
import ChaptersForm from "@/components/forms/chapters.form";
import apiHandlers from "@/server/handlers";



export default async function Page() {
  const { data: books } = await apiHandlers.books.getAll({ perPage: -1 })

  return (
    <div>
      <div className="flex items-center gap-5">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Add New Chapter
        </h1>
      </div>
      <div className="mt-8">
        <ChaptersForm books={books ?? []} />
      </div>
    </div>
  )
}