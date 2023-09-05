import { BackButton } from "@/components/dashboard/buttons";
import NotesEditorForm from "@/components/dashboard/forms/notes.form";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";



export default async function Page({ params }: { params: { id: string } }) {
  const { data: note } = await serverApiHandlers.notes.getById(Number(params.id), {
    user: true,
    verse: {
      include: {
        topic: {
          include: {
            chapter: {
              include: {
                book: true
              }
            }
          }
        }
      }
    }
  })
  if (!note) return notFound();

  return (
    <div>
      <div className="flex items-center gap-5 bg-white rounded-md shadow p-3">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Update Note
        </h1>
      </div>
      <div className="mt-4">
        <NotesEditorForm note={note} />
      </div>
    </div>
  )
}