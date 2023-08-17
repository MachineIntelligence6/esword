import { BackButton } from "@/components/dashboard/buttons";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/dashboard/ui/card"
import Link from "next/link";
import { buttonVariants } from "@/components/dashboard/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import db from "@/server/db";
import { ICommentary } from "@/shared/types/models.types";



export default async function Page({ params }: { params: { id: string } }) {
    const { data: note } = await serverApiHandlers.commentaries.getById(parseInt(params.id), {
        verse: { include: { topic: { include: { chapter: { include: { book: true } } } } } },
        author: true
    })
    if (!note) return notFound()

    const next = await db.note.findFirst({
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
    const previous = await db.note.findFirst({
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
        <div className="space-y-8">
            <div className="flex items-center gap-5 justify-between">
                <div className="flex items-start gap-5">
                    <BackButton />
                    <div className="max-w-screen-xl">
                        <h1 className="font-semibold text-2xl">
                            {note?.name}
                        </h1>
                        <p className="mt-3">{note.text}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={previous ? `/dashboard/notes/${previous.id}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full",
                            !previous && "opacity-60 pointer-events-none"
                        )}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                    <Link
                        href={next ? `/dashboard/notes/${next.id}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full",
                            !next && "opacity-60 pointer-events-none"
                        )}>
                        <ChevronRightIcon className="w-6 h-6" />
                    </Link>
                </div>
            </div>
            {/* <ICommentaryDetailsCard note={note} /> */}
        </div>
    )
}


function ICommentaryDetailsCard({ commentary }: { commentary: ICommentary }) {
    return (
        <Card className="w-fit">
            <CardHeader>
                <CardTitle className="text-xl">ICommentary Details</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between gap-20">
                <div className="flex items-center gap-5 flex-wrap text-base font-normal">
                    <span>Book:</span>
                    <span className="font-semibold">{commentary.verse?.topic?.chapter?.book?.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Chapter:</span>
                    <span className="font-semibold">{commentary?.verse?.topic?.chapter?.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Verse:</span>
                    <span className="font-semibold">{commentary?.verse?.number}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Name:</span>
                    <span className="font-semibold">{commentary.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Author:</span>
                    <span className="font-semibold">{commentary?.author?.name}</span>
                </div>
            </CardContent>
        </Card>
    )
}