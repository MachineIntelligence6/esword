import { BackButton } from "@/components/dashboard/buttons";
import NotesEditorForm from "@/components/dashboard/forms/notes.form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import db from "@/server/db";
import serverApiHandlers from "@/server/handlers";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
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

  const next = await db.note.findFirst({
    take: 1,
    where: {
      id: {
        gt: parseInt(params.id),
      },
      archived: false
    },
    orderBy: {
      id: "asc",
    },
  });
  const previous = await db.note.findFirst({
    take: 1,
    where: {
      id: {
        lt: parseInt(params.id),
      },
      archived: false
    },
    orderBy: {
      id: "asc",
    },
  });


  return (
    <div>
      <div className="flex items-center gap-5 justify-between bg-white rounded-md shadow p-3">
        <div className="flex items-center gap-5">
          <BackButton />
          <h1 className="font-semibold text-2xl">
            Note Details
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={previous ? `/dashboard/notes/${previous.id}` : '#'}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "aspect-square p-1 w-auto h-auto rounded-full",
              !previous && "opacity-60 pointer-events-none"
            )}>
            <ChevronLeftIcon className="w-6 h-6" />
          </Link>
          <Link
            href={next ? `/dashboard/notes/${next.id}` : '#'}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "aspect-square p-1 w-auto h-auto rounded-full",
              !next && "opacity-60 pointer-events-none"
            )}>
            <ChevronRightIcon className="w-6 h-6" />
          </Link>
        </div>
      </div>
      <div className="pt-5">
        <NotesEditorForm readonly note={note} />
      </div>
    </div>
  )
}