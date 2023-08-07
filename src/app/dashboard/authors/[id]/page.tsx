import { BackButton } from "@/components/buttons";
import apiHandlers from "@/server/handlers";
import { Commentary } from "@prisma/client";
import { notFound } from "next/navigation";
import CommentariesTable from "@/components/tables/commentaries.table";


export default async function Page({ params }: { params: { id: string } }) {
    const { data: author } = await apiHandlers.authors.getById(parseInt(params.id), { commentaries: true })
    if (!author) return notFound()
    const commentaries = (author as any).commentaries?.map((cmntry: Commentary) => ({ ...cmntry, author: author }))

    return (
        <div className="space-y-8">
            <div className="flex items-start gap-5">
                <BackButton />
                <div className="max-w-screen-xl">
                    <h1 className="font-semibold text-2xl">
                        {author.name}
                    </h1>
                    <p className="mt-3">{author.description}</p>
                </div>
            </div>
            <div className="pt-5">
                <h3 className="font-semibold text-2xl mb-5">Commentaries</h3>
                {commentaries && <CommentariesTable commentaries={commentaries} />}
            </div>
        </div>
    )
}
