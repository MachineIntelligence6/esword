import { BackButton } from "@/components/dashboard/buttons";
import VersesForm from "@/components/dashboard/forms/verses.form";
import serverApiHandlers from "@/server/handlers";



export default async function Page() {
  const { data: books } = await serverApiHandlers.books.getAll({ perPage: -1, include: { chapters: true } })

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