import { BackButton } from "@/components/buttons";
import VersesForm from "@/components/forms/verses.form";
import apiHandlers from "@/server/handlers";



export default async function Page() {
  const { data: books } = await apiHandlers.books.getAll({ perPage: -1, include: { chapters: true } })

  return (
    <div>
      <div className="flex items-center gap-5">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Add New Verse
        </h1>
      </div>
      <div className="mt-8">
        <VersesForm books={books ?? []} />
      </div>
    </div>
  )
}