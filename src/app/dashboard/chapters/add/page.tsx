import { BackButton } from "@/components/dashboard/buttons";
import ChaptersForm from "@/components/dashboard/forms/chapters.form";



export default async function Page() {
  return (
    <div>
      <div className="flex items-center gap-5">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Add New Chapter
        </h1>
      </div>
      <div className="mt-8">
        <ChaptersForm />
      </div>
    </div>
  )
}