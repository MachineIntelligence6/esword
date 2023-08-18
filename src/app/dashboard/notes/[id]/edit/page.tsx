import { BackButton } from "@/components/dashboard/buttons";
import NotesEditorForm from "@/components/dashboard/forms/notes.form";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";



export default async function Page({ params }: { params: { id: string } }) {
  const { data: note } = await serverApiHandlers.notes.getById(Number(params.id))
  if (!note) return notFound();

  return (
    <div>
      <div className="flex items-center gap-5">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Update Note
        </h1>
      </div>
      <div className="mt-8">
        <NotesEditorForm />
      </div>
    </div>
  )
}