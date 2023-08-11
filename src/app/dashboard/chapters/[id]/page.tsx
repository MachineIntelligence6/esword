import { BackButton } from "@/components/dashboard/buttons";
import serverApiHandlers from "@/server/handlers";
import { Chapter, Verse } from "@prisma/client";
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



export default async function Page({ params }: { params: { id: string } }) {
    const { data: chapter } = await serverApiHandlers.chapters.getByRef(params.id, { book: true })
    if (!chapter) return notFound()


    return (
        <div className="space-y-8">
            <div className="flex items-center gap-5 justify-between">
                <div className="flex items-center gap-5">
                    <BackButton />
                    <h1 className="font-semibold text-2xl">
                        {chapter?.name}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={parseInt(params.id) > 1 ? `/dashboard/chapters/${parseInt(params.id) - 1}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full"
                        )}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                    <Link href={`/dashboard/chapters/${parseInt(params.id) + 1}`}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full"
                        )}>
                        <ChevronRightIcon className="w-6 h-6" />
                    </Link>
                </div>
            </div>
            <ChapterDetailsCard chapter={chapter} />
            <div className="pt-5">
                <h3 className="font-semibold text-2xl mb-5">Verses</h3>
                <VersesTable chapter={chapter} />
            </div>
        </div>
    )
}


function ChapterDetailsCard({ chapter }: { chapter: Chapter }) {
    return (
        <Card className="w-fit">
            <CardHeader>
                <CardTitle className="text-xl">Chapter Details</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between gap-20">
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Book:</span>
                    <span className="font-semibold">{(chapter as any).book?.name}</span>
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