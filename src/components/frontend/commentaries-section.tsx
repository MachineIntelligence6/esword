'use client'

import { cn } from "@/lib/utils";
import { useReadBookStore } from "@/lib/zustand/readBookStore";
import { useEffect, useRef, useState } from "react";
import { AuthorsLoadingPlaceholder, CommentaryLoadingPlaceholder } from "../loading-placeholders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export default function CommentariesContentComponent() {
    const {
        activeVerse, activeCommentary,
        setActiveAuthor, activeAuthor, activeBook,
        activeChapter, initialLoading,
        booksList, chaptersList
    } = useReadBookStore()
    const [commentariesTab, setCommentariesTab] = useState<"chapter" | "verses">("chapter");

    const highlightRef = useRef(null);
    const authors = activeVerse.data?.commentaries?.map((commentary) => commentary.author)?.filter((author) => author !== undefined)
    const commentaries = activeAuthor?.data?.commentaries


    useEffect(() => {
        if (commentaries && commentaries.length > 0 && activeCommentary) setCommentariesTab("verses")
        // else if (activeChapter.data?.commentaryName || activeChapter.data?.commentaryText) setCommentariesTab("chapter")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeVerse, activeCommentary])


    const showPlaceholder = initialLoading || activeBook.loading || activeChapter.loading || activeVerse.loading || !booksList || !chaptersList


    return (
        <div className="lg:min-h-[400px] max-h-[40vh] flex flex-col">
            <div
                className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 pl-[10px] pr-[19px] lg:border-0 border-b lg:flex justify-between hidden">
                <h3 className="text-xs font-bold">
                    COMMENTARIES
                </h3>
            </div>
            <div className="h-full">
                <div className="flex border-b min-h-[39px] max-h-[39px] items-center px-3">
                    {
                        showPlaceholder ?
                            <AuthorsLoadingPlaceholder />
                            :
                            authors?.map((author) => (
                                author &&
                                <button
                                    key={author.id}
                                    type="button"
                                    onClick={() => setActiveAuthor(author)}
                                    className={cn(
                                        "text-xs font-medium px-3 py-2 transition-all",
                                        activeAuthor?.id === author.id ? "bg-primary text-white font-bold" : "hover:bg-primary hover:text-white hover:font-bold"
                                    )}>
                                    {author.name}
                                </button>
                            ))
                    }
                </div>
                {/*  content */}
                <div className="h-full max-h-full overflow-hidden" ref={highlightRef}>
                    <div className="lg:min-h-[250px] lg:max-h-[320px] bg-white max-w-full overflow-y-auto">
                        <Tabs className="w-full"
                            defaultValue="chapter"
                            value={commentariesTab}
                            onValueChange={(value) => setCommentariesTab(value === "verses" ? "verses" : "chapter")}>
                            <TabsList className="w-full justify-start rounded-none">
                                <TabsTrigger value="chapter">
                                    Chapter
                                </TabsTrigger>
                                <TabsTrigger value="verses">
                                    Verses
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="chapter">
                                {
                                    showPlaceholder ?
                                        <CommentaryLoadingPlaceholder />
                                        :
                                        (
                                            activeChapter.data && activeChapter.data.commentaryName && activeChapter.data.commentaryText ?
                                                (
                                                    <div>
                                                        <h1 className="font-bold text-light-green text-xl flex items-center justify-center pt-[10px]">
                                                            {`${activeBook.data?.name} ${activeChapter.data?.name}`}
                                                        </h1>
                                                        <h3 className="font-bold text-base text-primary-dark flex justify-center items-center py-[10px]">
                                                            {activeChapter.data?.commentaryName}
                                                        </h3>
                                                        <p className="lg:pl-4 lg:pr-2 px-[10px] text-primary-dark font-normal text-sm">
                                                            {activeChapter.data?.commentaryText}
                                                        </p>
                                                    </div>
                                                )
                                                :
                                                <div className="w-full h-full min-h-[200px] flex items-center justify-center">
                                                    <p className="font-medium">No commentaries.</p>
                                                </div>
                                        )
                                }
                            </TabsContent>
                            <TabsContent value="verses">
                                {
                                    showPlaceholder ?
                                        <CommentaryLoadingPlaceholder />
                                        :
                                        (
                                            commentaries && commentaries.length > 0 ?
                                                (
                                                    activeCommentary?.data &&
                                                    <div>
                                                        <h1 className="font-bold text-light-green text-xl flex items-center justify-center pt-[10px]">
                                                            {`${activeBook.data?.name} ${activeChapter.data?.name}:${activeVerse.data?.number}`}
                                                        </h1>
                                                        <h3 className="font-bold text-base text-primary-dark flex justify-center items-center py-[10px]">
                                                            {activeCommentary.data?.name}
                                                        </h3>
                                                        <p className="lg:pl-4 lg:pr-2 px-[10px] text-primary-dark font-normal text-sm">
                                                            {activeCommentary.data?.text}
                                                        </p>
                                                    </div>
                                                )
                                                :
                                                <div className="w-full h-full min-h-[200px] flex items-center justify-center">
                                                    <p className="font-medium">No commentaries.</p>
                                                </div>
                                        )
                                }
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}