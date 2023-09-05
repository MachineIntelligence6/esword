import { BackButton } from "@/components/dashboard/buttons";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import CommentariesTable from "@/components/dashboard/tables/commentaries.table";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotesTable from "@/components/dashboard/tables/notes.table";
import db from "@/server/db";
import { IVerse } from "@/shared/types/models.types";



export default async function Page({ params }: { params: { id: string } }) {
    const { data: verse } = await serverApiHandlers.verses.getById(parseInt(params.id), {
        topic: { include: { chapter: { include: { book: true } } } },
    })
    if (!verse) return notFound()
    const next = await db.verse.findFirst({
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
    const previous = await db.verse.findFirst({
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
        <div className="space-y-3">
            <div className="flex items-center gap-5 justify-between bg-white rounded-md shadow p-3">
                <div className="flex items-start gap-5">
                    <BackButton />
                    <div className="max-w-screen-xl">
                        <h1 className="font-semibold text-2xl">
                            {`${verse?.topic?.chapter?.book?.abbreviation} ${verse?.topic?.chapter?.name}:${verse?.number}`}
                        </h1>
                        <p className="mt-3">{verse.text}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={previous ? `/dashboard/verses/${previous.id}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full",
                            !previous && "opacity-60 pointer-events-none"
                        )}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                    <Link
                        href={next ? `/dashboard/verses/${next.id}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full",
                            !next && "opacity-60 pointer-events-none"
                        )}>
                        <ChevronRightIcon className="w-6 h-6" />
                    </Link>
                </div>
            </div>
            <IVerseDetailsCard verse={verse} />
            <div className="pt-5">
                <ContentTabs verse={verse} />
            </div>
        </div>
    )
}


type ContentTabsProps = {
    verse: IVerse;
}
function ContentTabs({ verse }: ContentTabsProps) {
    return (
        <Tabs defaultValue="commentaries" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="commentaries" className="text-base">Commentaries</TabsTrigger>
                <TabsTrigger value="notes" className="text-base">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="commentaries">
                <Card>
                    <CardHeader className="border-b-8 border-silver-light py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="font-bold text-2xl">
                                Commentaries
                            </CardTitle>
                            <Link target="_blank" href={`/dashboard/commentaries/add?book=${verse.topic?.chapter?.book?.id}&chapter=${verse?.topic?.chapter?.id}&verse=${verse.id}`}
                                className={buttonVariants({ variant: "default" })}>
                                Add New
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5">
                        <CommentariesTable verse={verse} />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="notes">
                <Card>
                    <CardHeader className="border-b-8 border-silver-light py-4">
                        <CardTitle className="font-bold text-2xl">
                            Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <NotesTable verse={verse} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}


function IVerseDetailsCard({ verse }: { verse: IVerse }) {
    return (
        <Card className="w-full lg:w-fit">
            <CardHeader>
                <CardTitle className="text-xl">Verse Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row justify-between gap-20">
                <div className="flex items-center gap-5 flex-wrap text-base font-normal">
                    <span>Book:</span>
                    <span className="font-semibold">{verse.topic?.chapter?.book?.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Chapter:</span>
                    <span className="font-semibold">{(verse.topic?.chapter)?.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Topic:</span>
                    <span className="font-semibold">{verse.topic?.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Number:</span>
                    <span className="font-semibold">{verse.number}</span>
                </div>
            </CardContent>
        </Card>
    )
}