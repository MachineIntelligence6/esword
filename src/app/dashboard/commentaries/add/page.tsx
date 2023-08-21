import { BackButton } from "@/components/dashboard/buttons";
import CommentariesForm from "@/components/dashboard/forms/commentaries.form";



export default async function Page() {
  return (
    <div>
      <div className="flex items-center gap-5 bg-white rounded-md shadow p-3">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Add New Commentary
        </h1>
      </div>
      <div className="mt-4">
        <CommentariesForm />
      </div>
    </div>
  )
}