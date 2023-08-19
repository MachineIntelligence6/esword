import { buttonVariants } from "@/components/dashboard/ui/button"
import Link from "next/link"
import VersesTable from "@/components/dashboard/tables/verses.table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/dashboard/ui/card"



export default async function Page() {
  return (
    <div>
      <Card className="min-h-[700px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-bold text-2xl">
              All Verses
            </CardTitle>
            <Link href="/dashboard/verses/add" className={buttonVariants({ variant: "default" })}>
              Add New
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <VersesTable />
        </CardContent>
      </Card>
    </div>
  )
}