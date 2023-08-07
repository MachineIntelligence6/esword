import { BackButton } from "@/components/buttons";
import ChaptersForm from "@/components/forms/chapters.form";
import VersesForm from "@/components/forms/verses.form";
import apiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";



export default async function Page({ params }: { params: { id: string } }) {
  const { data: verse } = await apiHandlers.verses.getById(parseInt(params.id), { chapter: true })
  if (!verse) return notFound();
  const { data: books } = await apiHandlers.books.getAll({ perPage: -1, include: { chapters: true } })

  return (
    <div>
      <div className="flex items-center gap-5">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Update Verse
        </h1>
      </div>
      <div className="mt-8">
        <VersesForm verse={verse} books={books ?? []} />
      </div>
    </div>
  )
}