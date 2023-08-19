'use client'
import clientApiHandlers from "@/client/handlers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card"
import { Separator } from "@/components/dashboard/ui/separator"
import Spinner from "@/components/spinner"
import { extractTextFromHtml } from "@/lib/utils"
import { PaginatedApiResponse } from "@/shared/types/api.types"
import { IBook, ICommentary, INote } from "@/shared/types/models.types"
import Link from "next/link"
import { useEffect, useState } from "react"





export function DBooksCard() {
    const [apiRes, setApiRes] = useState<PaginatedApiResponse<IBook[]>>()
    const books = apiRes?.data
    useEffect(() => {
        clientApiHandlers.books.get({ page: 1, perPage: 10, orderBy: { updatedAt: "desc" } })
            .then((res) => {
                setApiRes(res)
            })
    }, [])
    return (
        <Card className="w-full overflow-hidden h-full min-h-[300px]">
            <CardHeader className="py-4 bg-slate-100 border-b border-slate-300">
                <div className="w-full flex items-center justify-between">
                    <CardTitle className="text-lg">
                        Books : {apiRes?.pagination?.count}
                    </CardTitle>
                    <Link href='/dashboard/books' className="text-primary text-sm">
                        View All
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="py-4 px-0">
                {
                    books ?
                        (
                            books.length > 0 ?
                                <div className="divide-y-2 divide-slate-200 max-h-96 overflow-y-auto px-5">
                                    {
                                        books?.map((book) => (
                                            <div key={book.id} className="flex items-center justify-between px-2 py-3">
                                                <h4 className="font-medium text-base">
                                                    {book.name}
                                                </h4>
                                                <Link href={`/dashboard/books/${book.id}`} className="text-primary text-sm">
                                                    View
                                                </Link>
                                            </div>
                                        ))
                                    }
                                </div>
                                :
                                <div className="w-full h-full min-h-[250px] flex items-center justify-center">
                                    <p className="font-medium">No data.</p>
                                </div>
                        )
                        :
                        <div className="w-full h-full min-h-[250px] flex items-center justify-center">
                            <Spinner className="w-10 border-4" />
                        </div>
                }
            </CardContent>
        </Card>
    )
}

export function DNotesCard() {
    const [notes, setNotes] = useState<INote[] | null>(null)
    useEffect(() => {
        clientApiHandlers.notes.get({
            page: 1, perPage: 10, include: { user: true },
            orderBy: {
                updatedAt: "desc"
            }
        })
            .then((res) => {
                setNotes(res.data ?? [])
            })
    }, [])
    return (
        <Card className="w-full overflow-hidden h-full min-h-[300px]">
            <CardHeader className="py-4 bg-slate-100 border-b border-slate-300">
                <div className="w-full flex items-center justify-between">
                    <CardTitle className="text-lg">
                        Latest Notes
                    </CardTitle>
                    <Link href='/dashboard/notes' className="text-primary text-sm">
                        View All
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="py-4 px-0">
                {
                    notes ?
                        (
                            notes.length > 0 ?
                                <div className="divide-y-2 divide-slate-200 max-h-96 overflow-y-auto px-5">
                                    {
                                        notes.map((note) => (
                                            <div key={note.id} className="flex items-center justify-between px-2 py-3 gap-4">
                                                <h4 className="font-medium text-base min-w-max max-w-[100px] truncate">
                                                    {note.user?.name}
                                                </h4>
                                                <Separator orientation="vertical" className="h-5" />
                                                <p className="line-clamp-1 max-w-full text-sm">
                                                    {extractTextFromHtml(note.text)}
                                                </p>
                                                <Separator orientation="vertical" className="h-5" />
                                                <Link href={`/dashboard/notes/${note.id}`} className="text-primary text-sm">
                                                    View
                                                </Link>
                                            </div>
                                        ))
                                    }
                                </div>
                                :
                                <div className="w-full h-full min-h-[250px] flex items-center justify-center">
                                    <p className="font-medium">No data.</p>
                                </div>
                        )
                        :
                        <div className="w-full h-full min-h-[250px] flex items-center justify-center">
                            <Spinner className="w-10 border-4" />
                        </div>
                }

            </CardContent>
        </Card>
    )
}


// export function DCommentariesCard() {
//     const [verses, setVerses] = useState<IVerse[] | null>(null)
//     useEffect(() => {
//         clientApiHandlers.verses.get({
//             page: 1, perPage: 10, include: { topic: true },
//             orderBy: {
//                 updatedAt: "desc"
//             }
//         })
//             .then((res) => {
//                 setVerses(res.data ?? [])
//             })
//     }, [])
//     return (
//         <Card className="w-full overflow-hidden h-full min-h-[300px]">
//             <CardHeader className="py-4 bg-slate-100 border-b border-slate-300">
//                 <div className="w-full flex items-center justify-between">
//                     <CardTitle className="text-lg">
//                         Verses
//                     </CardTitle>
//                     <Link href='/dashboard/verses' className="text-primary text-sm">
//                         View All
//                     </Link>
//                 </div>
//             </CardHeader>
//             <CardContent className="py-4 px-0">
//                 {
//                     verses ?
//                         (
//                             verses.length > 0 ?
//                                 <div className="divide-y-2 divide-slate-200 max-h-96 overflow-y-auto px-5">
//                                     {
//                                         verses.map((verse) => (
//                                             <div key={verse.id} className="flex items-center justify-between px-2 py-3 gap-4">
//                                                 <h4 className="font-medium text-base min-w-fit max-w-[100px] overflow-hidden truncate">
//                                                     {new Date(verse.updatedAt).toLocaleString()}
//                                                 </h4>
//                                                 <Separator orientation="vertical" className="h-5" />
//                                                 <p className="line-clamp-1 max-w-full text-sm">
//                                                     {verse.text}
//                                                 </p>
//                                                 <Separator orientation="vertical" className="h-5" />
//                                                 <Link href={`/dashboard/verses/${verse.id}`} className="text-primary text-sm">
//                                                     View
//                                                 </Link>
//                                             </div>
//                                         ))
//                                     }
//                                 </div>
//                                 :
//                                 <div className="w-full h-full min-h-[250px] flex items-center justify-center">
//                                     <p className="font-medium">No data.</p>
//                                 </div>
//                         )
//                         :
//                         <div className="w-full h-full min-h-[250px] flex items-center justify-center">
//                             <Spinner className="w-10 border-4" />
//                         </div>
//                 }

//             </CardContent>
//         </Card>
//     )
// }

export function DCommentariesCard() {
    const [commentaries, setCommentaries] = useState<ICommentary[] | null>(null)
    useEffect(() => {
        clientApiHandlers.commentaries.get({
            page: 1, perPage: 10, include: { author: true },
            orderBy: {
                updatedAt: "desc"
            }
        })
            .then((res) => {
                setCommentaries(res.data ?? [])
            })
    }, [])
    return (
        <Card className="w-full overflow-hidden h-full min-h-[300px]">
            <CardHeader className="py-4 bg-slate-100 border-b border-slate-300">
                <div className="w-full flex items-center justify-between">
                    <CardTitle className="text-lg">
                        Commentaries
                    </CardTitle>
                    <Link href='/dashboard/commentaries' className="text-primary text-sm">
                        View All
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="py-4 px-0">
                {
                    commentaries ?
                        (
                            commentaries.length > 0 ?
                                <div className="divide-y-2 divide-slate-200 max-h-96 overflow-y-auto px-5">
                                    {
                                        commentaries.map((commentary) => (
                                            <div key={commentary.id} className="flex items-center justify-between px-2 py-3 gap-4">
                                                <h4 className="font-medium text-base min-w-max max-w-[100px] truncate">
                                                    {commentary.author?.name}
                                                </h4>
                                                <Separator orientation="vertical" className="h-5" />
                                                <p className="line-clamp-1 max-w-full text-sm">
                                                    {commentary.name}
                                                </p>
                                                <Separator orientation="vertical" className="h-5" />
                                                <Link href={`/dashboard/commentaries/${commentary.id}`} className="text-primary text-sm">
                                                    View
                                                </Link>
                                            </div>
                                        ))
                                    }
                                </div>
                                :
                                <div className="w-full h-full min-h-[250px] flex items-center justify-center">
                                    <p className="font-medium">No data.</p>
                                </div>
                        )
                        :
                        <div className="w-full h-full min-h-[250px] flex items-center justify-center">
                            <Spinner className="w-10 border-4" />
                        </div>
                }

            </CardContent>
        </Card>
    )
}

export function DLogsCard() {
    return (
        <Card className="w-full overflow-hidden h-full min-h-[300px]">
            <CardHeader className="py-4 bg-slate-100 border-b border-slate-300">
                <div className="w-full flex items-center justify-between">
                    <CardTitle className="text-lg">
                        Recent Activities
                    </CardTitle>
                    <Link href='#' className="text-primary text-sm">
                        View All
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="py-4 px-0">
                <div className="divide-y-2 divide-slate-200 max-h-96 overflow-y-auto px-5">
                    <div className="flex items-center justify-between px-2 py-3 gap-4">
                        <h4 className="font-medium text-base min-w-max max-w-[100px] truncate">
                            User Name
                        </h4>
                        <Separator orientation="vertical" className="h-5" />
                        <p className="line-clamp-1 max-w-full text-sm">
                            Activity
                        </p>
                        <Separator orientation="vertical" className="h-5" />
                        <p className="min-w-max text-sm" suppressHydrationWarning>
                            {new Date().toLocaleString()}
                        </p>
                        <Separator orientation="vertical" className="h-5" />
                        <Link href='#' className="text-primary text-sm">
                            View
                        </Link>
                    </div>

                    <div className="flex items-center justify-between px-2 py-3 gap-4">
                        <h4 className="font-medium text-base min-w-max max-w-[100px] truncate">
                            User Name
                        </h4>
                        <Separator orientation="vertical" className="h-5" />
                        <p className="line-clamp-1 max-w-full text-sm">
                            Activity
                        </p>
                        <Separator orientation="vertical" className="h-5" />
                        <p className="min-w-max text-sm" suppressHydrationWarning>
                            {new Date().toLocaleString()}
                        </p>
                        <Separator orientation="vertical" className="h-5" />
                        <Link href='#' className="text-primary text-sm">
                            View
                        </Link>
                    </div>

                    <div className="flex items-center justify-between px-2 py-3 gap-4">
                        <h4 className="font-medium text-base min-w-max max-w-[100px] truncate">
                            User Name
                        </h4>
                        <Separator orientation="vertical" className="h-5" />
                        <p className="line-clamp-1 max-w-full text-sm">
                            Activity
                        </p>
                        <Separator orientation="vertical" className="h-5" />
                        <p className="min-w-max text-sm" suppressHydrationWarning>
                            {new Date().toLocaleString()}
                        </p>
                        <Separator orientation="vertical" className="h-5" />
                        <Link href='#' className="text-primary text-sm">
                            View
                        </Link>
                    </div>

                </div>
            </CardContent>
        </Card>
    )
}
