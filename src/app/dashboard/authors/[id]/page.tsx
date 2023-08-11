import { BackButton } from "@/components/dashboard/buttons";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";
import CommentariesTable from "@/components/dashboard/tables/commentaries.table";
import Link from "next/link";
import { buttonVariants } from "@/components/dashboard/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";


export default async function Page({ params }: { params: { id: string } }) {
    const { data: author } = await serverApiHandlers.authors.getById(parseInt(params.id), { commentaries: { take: 10, include: { author: true, verse: true } } })
    if (!author) return notFound()
    const commentaries = (author as any).commentaries

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-5 justify-between">
                <div className="flex items-start gap-5">
                    <BackButton />
                    <div className="max-w-screen-xl">
                        <h1 className="font-semibold text-2xl">
                            {author?.name}
                        </h1>
                        <p className="mt-3">{author.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={parseInt(params.id) > 1 ? `/dashboard/authors/${parseInt(params.id) - 1}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full"
                        )}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                    <Link
                        href={`/dashboard/authors/${parseInt(params.id) + 1}`}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full"
                        )}>
                        <ChevronRightIcon className="w-6 h-6" />
                    </Link>
                </div>
            </div>
            <div className="pt-5">
                <h3 className="font-semibold text-2xl mb-5">Commentaries</h3>
                {commentaries && <CommentariesTable commentaries={commentaries} />}
            </div>
        </div>
    )
}
