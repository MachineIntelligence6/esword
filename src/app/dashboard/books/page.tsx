import apiHandlers from "@/server/handlers"
import PageContent from "./content"



export default async function Page() {
  const { data: books } = await apiHandlers.books.getAll({ page: 1, perPage: 200 })
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-2xl">
          Books
        </h1>
      </div>
      {books && <PageContent books={books} />}
    </div>
  )
}