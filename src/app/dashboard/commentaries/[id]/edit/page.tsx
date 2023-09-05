import { BackButton } from "@/components/dashboard/buttons";
import CommentariesForm from "@/components/dashboard/forms/commentaries.form";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";



export default async function Page({ params }: { params: { id: string } }) {
  const { data: commentary } = await serverApiHandlers.commentaries.getById(parseInt(params.id), {
    verse: { include: { topic: { include: { chapter: { include: { book: true } } } } } },
    author: true
  })
  if (!commentary) return notFound();

  return (
    <div>
      <div className="flex items-center gap-5 bg-white rounded-md shadow p-3">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Update Commentary
        </h1>
      </div>
      <div className="mt-8">
        <CommentariesForm commentary={commentary} />
      </div>
    </div>
  )
}