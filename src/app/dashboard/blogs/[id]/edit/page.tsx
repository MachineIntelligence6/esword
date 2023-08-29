import { BackButton } from "@/components/dashboard/buttons";
import BlogsForm from "@/components/dashboard/forms/blogs.form";
import ChaptersForm from "@/components/dashboard/forms/chapters.form";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";



export default async function Page({ params }: { params: { id: string } }) {
  const { data: blog } = await serverApiHandlers.blogs.getByRef(params.id)
  if (!blog) return notFound();

  return (
    <div>
      <div className="flex items-center gap-5 bg-white rounded-md shadow p-3">
        <BackButton />
        <h1 className="font-semibold text-2xl">
          Update Blog
        </h1>
      </div>
      <div className="mt-8">
        <BlogsForm blog={blog} />
      </div>
    </div>
  )
}