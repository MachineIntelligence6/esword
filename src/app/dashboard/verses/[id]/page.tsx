import { BackButton } from "@/components/dashboard/buttons";
import serverApiHandlers from "@/server/handlers";
import { Commentary, Note, Verse } from "@prisma/client";
import { notFound } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/dashboard/ui/card"
import CommentariesTable from "@/components/dashboard/tables/commentaries.table";
import Link from "next/link";
import { buttonVariants } from "@/components/dashboard/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard/ui/tabs";
import { Label } from "@/components/dashboard/ui/label";
import { Input } from "@/components/frontend/ui/input";
import NotesTable from "@/components/dashboard/tables/notes.table";



export default async function Page({ params }: { params: { id: string } }) {
    const { data: verse } = await serverApiHandlers.verses.getById(parseInt(params.id), {
        chapter: { include: { book: true } },
    })
    if (!verse) return notFound()

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-5 justify-between">
                <div className="flex items-start gap-5">
                    <BackButton />
                    <div className="max-w-screen-xl">
                        <h1 className="font-semibold text-2xl">
                            {verse?.name}
                        </h1>
                        <p className="mt-3">{verse.text}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={parseInt(params.id) > 1 ? `/dashboard/verses/${parseInt(params.id) - 1}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full"
                        )}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                    <Link
                        href={`/dashboard/verses/${parseInt(params.id) + 1}`}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full"
                        )}>
                        <ChevronRightIcon className="w-6 h-6" />
                    </Link>
                </div>
            </div>
            <VerseDetailsCard verse={verse} />
            <div className="mt-5">
                <ContentTabs verse={verse} />
            </div>
        </div>
    )
}


type ContentTabsProps = {
    verse: Verse;
}
function ContentTabs({ verse }: ContentTabsProps) {
    return (
        <Tabs defaultValue="commentaries" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="commentaries">Commentaries</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="commentaries">
                <div className="flex items-center justify-between pb-5">
                    <h3 className="font-semibold text-2xl">Commentaries</h3>
                    <Link href={`/dashboard/commentaries/add?book=${(verse as any)?.chapter?.book?.id}&chapter=${(verse as any)?.chapter?.id}&verse=${verse.id}`}
                        className={buttonVariants({ variant: "default" })}>
                        Add New
                    </Link>
                </div>
                <CommentariesTable verse={verse} />
            </TabsContent>
            <TabsContent value="notes">
                <div className="flex items-center justify-between pb-5">
                    <h3 className="font-semibold text-2xl">Notes</h3>
                </div>
                <NotesTable verse={verse} />
            </TabsContent>
        </Tabs>
    )
}


function VerseDetailsCard({ verse }: { verse: Verse }) {
    return (
        <Card className="w-fit">
            <CardHeader>
                <CardTitle className="text-xl">Verse Details</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between gap-20">
                <div className="flex items-center gap-5 flex-wrap text-base font-normal">
                    <span>Book:</span>
                    <span className="font-semibold">{((verse as any).chapter as any)?.book?.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Chapter:</span>
                    <span className="font-semibold">{((verse as any).chapter)?.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Name:</span>
                    <span className="font-semibold">{verse.name}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Number:</span>
                    <span className="font-semibold">{verse.number}</span>
                </div>
                <div className="flex items-center gap-5 text-base font-normal">
                    <span>Type:</span>
                    <span className="font-semibold">{verse.type}</span>
                </div>
            </CardContent>
        </Card>
    )
}