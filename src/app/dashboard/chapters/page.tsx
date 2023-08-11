import { buttonVariants } from "@/components/dashboard/ui/button"
import Link from "next/link"
import ChaptersTable from "@/components/dashboard/tables/chapters.table"



export default function Page() {

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
      <ChaptersTable />
    </div>
  )
}