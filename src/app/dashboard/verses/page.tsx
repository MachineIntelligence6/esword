import apiHandlers from "@/server/handlers"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import VersesTable from "@/components/tables/verses.table"



export default async function Page() {
  const { data: verses } = await apiHandlers.verses.getAll({
    page: 1,
    perPage: -1,
    include: { chapter: true }
  })
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">
          All Verses
        </h1>
        <Link href="/dashboard/verses/add" className={buttonVariants({ variant: "default" })}>
          Add New
        </Link>
      </div>
      {
        verses && <VersesTable verses={verses} />
      }
    </div>
  )
}