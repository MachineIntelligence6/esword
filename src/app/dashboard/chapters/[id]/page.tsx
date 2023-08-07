import { BackButton } from "@/components/buttons";
import apiHandlers from "@/server/handlers";
import { Chapter, Verse } from "@prisma/client";
import { notFound } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import VersesTable from "@/components/tables/verses.table";



export default async function Page({ params }: { params: { id: string } }) {
    const { data: chapter } = await apiHandlers.chapters.getByRef(params.id, { book: true, verses: true })
    if (!chapter) return notFound()
    const verses = (chapter as (Chapter & { verses: Verse[] })).verses.map((verse) => ({ ...verse, chapter: chapter }))


    return (
        <div className="space-y-8">
            <div className="flex items-center gap-5">
                <BackButton />
                <h1 className="font-semibold text-2xl">
                    {chapter?.name}
                </h1>
            </div>
            <ChapterDetailsCard chapter={chapter} />
            <div className="pt-5">
                <h3 className="font-semibold text-2xl mb-5">Verses</h3>
                {verses && <VersesTable verses={verses} />}
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