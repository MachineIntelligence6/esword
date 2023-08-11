import { buttonVariants } from "@/components/dashboard/ui/button"
import Link from "next/link"
import CommentariesTable from "@/components/dashboard/tables/commentaries.table"



export default function Page() {

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
      <CommentariesTable />
    </div>
  )
}