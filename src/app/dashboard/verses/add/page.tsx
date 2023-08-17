import { BackButton } from "@/components/dashboard/buttons";
import VersesForm from "@/components/dashboard/forms/verses.form";



export default async function Page() {

  return (
    <div>
      <div className="flex items-center gap-5">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Add New Verse
        </h1>
      </div>
      <div className="mt-8">
        <VersesForm />
      </div>
    </div>
  )
}