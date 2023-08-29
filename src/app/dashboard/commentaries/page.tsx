import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import CommentariesTable from "@/components/dashboard/tables/commentaries.table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"



export default function Page() {

  return (
    <div>
      <Card className="min-h-[600px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-bold text-2xl">
              All Commentaries
            </CardTitle>
            <Link href="/dashboard/commentaries/add" className={buttonVariants({ variant: "default" })}>
              Add New
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-5 md:p-5">
          <CommentariesTable />
        </CardContent>
      </Card>
    </div>
  )
}