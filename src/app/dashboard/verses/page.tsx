import { buttonVariants } from "@/components/dashboard/ui/button"
import Link from "next/link"
import VersesTable from "@/components/dashboard/tables/verses.table"



export default async function Page() {
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
      <VersesTable />
    </div>
  )
}