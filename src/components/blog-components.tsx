import { IBlog } from "@/shared/types/models.types"
import QuillEditor from "./ui/editor"



type Props = {
    blog: IBlog
}

export default function BlogDetailView({ blog }: Props) {
    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold text-center w-full mb-5">{blog.title}</h1>
            <QuillEditor disabled value={blog.content} />
        </div>
    )
}