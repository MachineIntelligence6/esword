import Image from "next/image"

import { columns } from "@/components/tables/columns/books-table-columns"
import { DataTable } from "@/components/tables/data-table"
import apiHandlers from "@/server/handlers"



export default async function TaskPage() {
  const { data: books } = await apiHandlers.books.getAll(1, -1)

  return (
    <>
      <div>
        {
          books &&
          <DataTable data={books} columns={columns} />
        }
      </div>
    </>
  )
}