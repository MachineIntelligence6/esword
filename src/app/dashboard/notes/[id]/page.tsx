import { BackButton } from "@/components/dashboard/buttons";
import serverApiHandlers from "@/server/handlers";
import { Commentary } from "@prisma/client";
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



export default async function Page({ params }: { params: { id: string } }) {
    const { data: note } = await serverApiHandlers.commentaries.getById(parseInt(params.id), {
        verse: { include: { chapter: { include: { book: true } } } },
        author: true
    })
    if (!note) return notFound()

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
                        href={parseInt(params.id) > 1 ? `/dashboard/commentaries/${parseInt(params.id) - 1}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full"
                        )}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                    <Link
                        href={`/dashboard/commentaries/${parseInt(params.id) + 1}`}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full"
                        )}>
                        <ChevronRightIcon className="w-6 h-6" />
                    </Link>
                </div>
            </div>
            {/* <CommentaryDetailsCard note={note} /> */}
        </div>
    )
}


function CommentaryDetailsCard({ commentary }: { commentary: Commentary }) {
    return (
        <Card className="w-fit">
            <CardHeader>
                <CardTitle className="text-xl">Commentary Details</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between gap-20">
                <div className="flex items-center gap-5 flex-wrap text-base font-normal">
                    <span>Book:</span>
                    <span className="font-semibold">{(commentary as any).verse?.chapter?.book?.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Chapter:</span>
                    <span className="font-semibold">{(commentary as any)?.verse?.chapter?.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Verse:</span>
                    <span className="font-semibold">{(commentary as any)?.verse?.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Name:</span>
                    <span className="font-semibold">{commentary.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Author:</span>
                    <span className="font-semibold">{(commentary as any)?.author?.name}</span>
                </div>
            </CardContent>
        </Card>
    )
}