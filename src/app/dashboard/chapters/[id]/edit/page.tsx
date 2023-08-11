import { BackButton } from "@/components/dashboard/buttons";
import ChaptersForm from "@/components/dashboard/forms/chapters.form";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";



export default async function Page({ params }: { params: { id: string } }) {
  const { data: chapter } = await serverApiHandlers.chapters.getByRef(params.id)
  if (!chapter) return notFound();
  const { data: books } = await serverApiHandlers.books.getAll({ perPage: -1 })

  return (
    <div>
      <div className="flex items-center gap-5">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Update Chapter
        </h1>
      </div>
      <div className="mt-8">
        <ChaptersForm chapter={chapter} books={books ?? []} />
      </div>
    </div>
  )
}