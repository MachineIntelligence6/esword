import apiHandlers from "@/server/handlers"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import CommentariesTable from "@/components/tables/commentaries.table"



export default async function Page() {
  const { data: commentaries } = await apiHandlers.commentaries.getAll({
    page: 1,
    perPage: -1,
    include: { author: true, verse: true }
  })
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">
          All Commentaries
        </h1>
        <Link href="/dashboard/commentaries/add" className={buttonVariants({ variant: "default" })}>
          Add New
        </Link>
      </div>
      {
        commentaries && <CommentariesTable commentaries={commentaries} />
      }
    </div>
  )
}