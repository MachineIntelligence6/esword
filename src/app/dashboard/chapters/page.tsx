import apiHandlers from "@/server/handlers"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import ChaptersTable from "@/components/tables/chapters.table"
import { ChapterWBook } from "@/shared/types/models.types"



export default async function Page() {
  const { data: chapters } = await apiHandlers.chapters.getAll({
    page: 1,
    perPage: -1,
    include: { book: true }
  })
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">
          All Chapters
        </h1>
        <Link href="/dashboard/chapters/add" className={buttonVariants({ variant: "default" })}>
          Add New
        </Link>
      </div>
      {
        chapters && <ChaptersTable chapters={chapters as ChapterWBook[]} />
      }
    </div>
  )
}