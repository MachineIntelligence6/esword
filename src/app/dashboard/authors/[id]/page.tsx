import { BackButton } from "@/components/dashboard/buttons";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";
import CommentariesTable from "@/components/dashboard/tables/commentaries.table";
import Link from "next/link";
import { buttonVariants } from "@/components/dashboard/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import db from "@/server/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/dashboard/ui/card";


export default async function Page({ params }: { params: { id: string } }) {
    const { data: author } = await serverApiHandlers.authors.getById(parseInt(params.id))
    if (!author) return notFound()

    const next = await db.author.findFirst({
        take: 1,
        where: {
            id: {
                gt: parseInt(params.id),
            },
            archived: false
        },
        orderBy: {
            id: "asc",
        },
    });
    const previous = await db.author.findFirst({
        take: 1,
        where: {
            id: {
                lt: parseInt(params.id),
            },
            archived: false
        },
        orderBy: {
            id: "asc",
        },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-5 justify-between bg-white rounded-md shadow p-3">
                <div className="flex items-start gap-5">
                    <BackButton />
                    <div className="max-w-screen-xl">
                        <h1 className="font-semibold text-2xl">
                            {author?.name}
                        </h1>
                        <p className="mt-2">{author.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={previous ? `/dashboard/authors/${previous.id}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full",
                            !previous && "opacity-60 pointer-events-none"
                        )}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                    <Link
                        href={next ? `/dashboard/authors/${next.id}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full",
                            !next && "opacity-60 pointer-events-none"
                        )}>
                        <ChevronRightIcon className="w-6 h-6" />
                    </Link>
                </div>
            </div>
            <div className="pt-5">
                <Card>
                    <CardHeader className="border-b-8 border-silver-light py-4">
                        <CardTitle className="font-bold text-2xl">
                            Commentaries
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <CommentariesTable author={author} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
