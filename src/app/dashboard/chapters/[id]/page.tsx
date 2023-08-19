import { BackButton } from "@/components/dashboard/buttons";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/dashboard/ui/card"
import VersesTable from "@/components/dashboard/tables/verses.table";
import Link from "next/link";
import { buttonVariants } from "@/components/dashboard/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import db from "@/server/db";
import { IChapter } from "@/shared/types/models.types";
import TopicsTable from "@/components/dashboard/tables/topics.table";



export default async function Page({ params }: { params: { id: string } }) {
    const { data: chapter } = await serverApiHandlers.chapters.getByRef(params.id, { book: true })
    if (!chapter) return notFound()

    const next = await db.chapter.findFirst({
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
    const previous = await db.chapter.findFirst({
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
                <div className="flex items-center gap-5">
                    <BackButton />
                    <h1 className="font-semibold text-2xl">
                        {`${chapter.book?.name} / Chapter ${chapter?.name}`}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={previous ? `/dashboard/chapters/${previous.id}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full",
                            !previous && "opacity-60 pointer-events-none"
                        )}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                    <Link
                        href={next ? `/dashboard/chapters/${next.id}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full",
                            !next && "opacity-60 pointer-events-none"
                        )}>
                        <ChevronRightIcon className="w-6 h-6" />
                    </Link>
                </div>
            </div>
            <ChapterDetailsCard chapter={chapter} />
            <div className="pt-5">
                <Card>
                    <CardHeader className="border-b-8 border-silver-light py-4">
                        <CardTitle className="font-bold text-2xl">
                            All Topics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <TopicsTable chapter={chapter} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


function ChapterDetailsCard({ chapter }: { chapter: IChapter }) {
    return (
        <Card className="w-fit">
            <CardHeader>
                <CardTitle className="text-xl">Chapter Details</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between gap-20">
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Book:</span>
                    <span className="font-semibold">{chapter.book?.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Name:</span>
                    <span className="font-semibold">{chapter.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Slug:</span>
                    <span className="font-semibold">{chapter.slug}</span>
                </div>
            </CardContent>
        </Card>
    )
}