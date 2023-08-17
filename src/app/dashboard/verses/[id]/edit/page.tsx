import { BackButton } from "@/components/dashboard/buttons";
import IVersesForm from "@/components/dashboard/forms/verses.form";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";



export default async function Page({ params }: { params: { id: string } }) {
  const { data: verse } = await serverApiHandlers.verses.getById(parseInt(params.id), { topic: { include: { chapter: true } } })
  if (!verse) return notFound();

  return (
    <div>
      <div className="flex items-center gap-5">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Update Verse
        </h1>
      </div>
      <div className="mt-8">
        <IVersesForm verse={verse} />
      </div>
    </div>
  )
}