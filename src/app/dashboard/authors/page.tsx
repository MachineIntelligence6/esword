import apiHandlers from "@/server/handlers"
import PageContent from "./content"



export default async function Page() {
  const { data: authors } = await apiHandlers.authors.getAll({ page: 1, perPage: 200 })
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-2xl">
          Authors
        </h1>
      </div>
      {authors && <PageContent authors={authors} />}
    </div>
  )
}