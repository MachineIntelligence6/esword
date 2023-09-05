import { BackButton } from "@/components/dashboard/buttons";
import BlogsForm from "@/components/dashboard/forms/blogs.form";



export default async function Page() {
  return (
    <div>
      <div className="flex items-center gap-5 bg-white rounded-md shadow p-3">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Add New Blog
        </h1>
      </div>
      <div className="mt-4">
        <BlogsForm />
      </div>
    </div>
  )
}