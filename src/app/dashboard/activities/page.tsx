import ActivitiesTable from "@/components/dashboard/tables/activities.table"
import ChaptersTable from "@/components/dashboard/tables/chapters.table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"



export default function Page() {

  return (
    <div>
      <Card className="min-h-[600px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <CardTitle className="font-bold text-2xl">
            Activities
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <ActivitiesTable />
        </CardContent>
      </Card>
    </div>
  )
}