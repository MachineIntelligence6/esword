import { buttonVariants } from "@/components/dashboard/ui/button"
import Link from "next/link"
import ChaptersTable from "@/components/dashboard/tables/chapters.table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card"



export default function Page() {

  return (
    <div>
      <Card className="min-h-[700px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-bold text-2xl">
              All Chapters
            </CardTitle>
            <Link href="/dashboard/chapters/add" className={buttonVariants({ variant: "default" })}>
              Add New
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <ChaptersTable />
        </CardContent>
      </Card>
    </div>
  )
}