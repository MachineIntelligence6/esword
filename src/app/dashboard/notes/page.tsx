import NotesTable from "@/components/dashboard/tables/notes.table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"



export default function Page() {
  return (
    <div>
      <Card className="min-h-[600px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <CardTitle className="font-bold text-2xl">
            All Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <NotesTable />
        </CardContent>
      </Card>
    </div>
  )
}