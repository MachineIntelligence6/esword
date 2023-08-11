import Link from "next/link"
import NotesTable from "@/components/dashboard/tables/notes.table"



export default function Page() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">
          All Notes
        </h1>
        {/* <Link href="/dashboard/notes/add" className={buttonVariants({ variant: "default" })}>
          Add New
        </Link> */}
      </div>
      <NotesTable />
    </div>
  )
}