'use client'
import { cn } from "@/lib/utils";
import { useReadBookStore } from "@/lib/zustand/readBookStore";
import { useEffect, useRef, useState } from "react";
import { AuthorsLoadingPlaceholder, CommentaryLoadingPlaceholder } from "../loading-placeholders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import QuillEditor from "../ui/editor";

export default function CommentariesContentComponent({ variant }: { variant: "MOBILE" | "DESKTOP" }) {
    const {
        activeVerse,
        setActiveAuthor, activeBook,
        activeChapter, initialLoading,
        booksList, chaptersList
    } = useReadBookStore()
    const [commentariesTab, setCommentariesTab] = useState<"chapter" | "verses">("chapter");

    const highlightRef = useRef(null);
    const authors = activeVerse.authors?.list
    const activeAuthor = activeVerse.authors?.active


    useEffect(() => {
        if (activeVerse.data && activeAuthor?.commentaries?.active) setCommentariesTab("verses")
        // else if (activeChapter.data?.commentaryName || activeChapter.data?.commentaryText) setCommentariesTab("chapter")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeVerse, activeAuthor])


    const showPlaceholder = initialLoading || activeBook.loading || activeChapter.loading || activeVerse.loading || !booksList || !chaptersList


    return (
        <div className={cn(
            "lg:min-h-[400px] flex flex-col",
            variant === "MOBILE" ? "flex lg:hidden" : "hidden lg:flex",
        )}>
            {/* title */}
            <div className="toggle-btn bg-silver-light py-3  lg:pl-3 pl-[10px] pr-[19px] lg:border-0 border-b lg:flex justify-between hidden">
                <h3 className="text-xs font-bold ">
                    COMMENTARIES
                </h3>
            </div>
            <div className="flex-1 flex flex-col">
                <div className="flex border-b min-h-[40px] max-h-[40px] items-center px-2 gap-2 max-w-full overflow-x-auto overflow-hidden">
                    {
                        showPlaceholder ?
                            <AuthorsLoadingPlaceholder />
                            :
                            authors?.map((author) => (
                                author &&
                                <button
                                    key={author.id}
                                    type="button"
                                    onClick={() => setActiveAuthor(author.id)}
                                    className={cn(
                                        "text-xs font-medium  px-3 py-2 transition-all rounded-[4px]",
                                        activeAuthor?.id === author.id ? "bg-secondary text-primary-dark font-bold" : "hover:bg-secondary hover:text-primary-dark hover:font-bold"
                                    )}>
                                    {author.name}
                                </button>
                            ))
                    }
                </div>
                {/*  content */}
                <div className="flex-1" ref={highlightRef}>
                    <div className="max-h-full bg-white max-w-full">
                        <Tabs className="w-full"
                            defaultValue="chapter"
                            value={commentariesTab}
                            onValueChange={(value) => setCommentariesTab(value === "verses" ? "verses" : "chapter")}>
                            <div className="bg-silver-light flex items-center justify-between gap-5 px-1">
                                <TabsList className="bg-transparent rounded-none">
                                    <TabsTrigger value="chapter">
                                        Chapter
                                    </TabsTrigger>
                                    <TabsTrigger value="verses">
                                        Verses
                                    </TabsTrigger>
                                </TabsList>
                                <NextPrevCommentaryComp />
                            </div>
                            <TabsContent value="chapter" className="mt-0 max-h-full overflow-hidden">
                                {
                                    !chaptersList || activeChapter.loading ?
                                        <CommentaryLoadingPlaceholder />
                                        :
                                        (
                                            activeChapter.data && activeChapter.data.commentaryName && activeChapter.data.commentaryText ?
                                                (
                                                    <div className="max-h-[500px] min-h-[500px] lg:min-h-0 lg:max-h-full overflow-y-auto">
                                                        <h1 className="font-bold text-light-green text-xl flex items-center justify-center pt-[10px]">
                                                            {`${activeBook.data?.name} ${activeChapter.data?.name}`}
                                                        </h1>
                                                        <h3 className="font-bold text-base text-primary-dark flex justify-center items-center py-[10px]">
                                                            {activeChapter.data?.commentaryName}
                                                        </h3>
                                                        <div className="lg:pl-4 lg:pr-2 px-[10px]">
                                                            <QuillEditor disabled value={activeChapter.data?.commentaryText ?? ""} maxHeight={false} />
                                                        </div>
                                                    </div>
                                                )
                                                :
                                                <div className="w-full h-full min-h-[200px] flex items-center justify-center">
                                                    <p className="font-medium">No commentaries.</p>
                                                </div>
                                        )
                                }
                            </TabsContent>
                            <TabsContent value="verses" className="mt-0 max-h-full overflow-hidden">
                                {
                                    showPlaceholder ?
                                        <CommentaryLoadingPlaceholder />
                                        :
                                        (
                                            activeAuthor?.commentaries?.list && activeAuthor.commentaries.list.length > 0 ?
                                                (
                                                    activeAuthor.commentaries.active &&
                                                    <div className="max-h-[500px] min-h-[500px] lg:min-h-0 lg:max-h-full overflow-y-auto">
                                                        <h1 className="font-bold text-light-green text-base flex items-center justify-center pt-[10px] font-roman md:text-xl">
                                                            {`${activeBook.data?.name} ${activeChapter.data?.name}:${activeVerse.data?.number}`}
                                                        </h1>
                                                        <h3 className="font-bold text-sm text-primary-dark flex justify-center items-center py-[10px] font-roman md:text-base">
                                                            {activeAuthor.commentaries.active?.name}
                                                        </h3>
                                                        <div className="lg:pl-4 lg:pr-2 px-[10px] max-h-[200px]">
                                                            <QuillEditor disabled value={activeAuthor.commentaries.active?.text ?? ""} maxHeight={false} />
                                                        </div>
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




function NextPrevCommentaryComp() {
    const { activeVerse, setActiveCommentary } = useReadBookStore()

    const commentaries = activeVerse.authors?.active?.commentaries?.list
    const activeCommentary = activeVerse.authors?.active?.commentaries?.active
    const activeCommentaryIndex = commentaries?.findIndex((c) => c.id === activeCommentary?.id) ?? -1
    const next = (commentaries && activeCommentaryIndex >= 0 && (activeCommentaryIndex + 1) < commentaries?.length) ? commentaries[activeCommentaryIndex + 1] : undefined
    const previous = (commentaries && activeCommentaryIndex >= 1) ? commentaries[activeCommentaryIndex - 1] : undefined



    return (
        <div className="flex items-center gap-2 pr-2">
            <Button variant="ghost"
                disabled={!previous}
                onClick={() => previous && setActiveCommentary(previous.id)}
                className={cn(
                    "aspect-square p-1 w-auto h-auto rounded-full",
                    !previous && "opacity-60 pointer-events-none"
                )}>
                <ChevronLeftIcon className="w-6 h-6 hover:scale-110 transition-all" />
            </Button>
            <Button variant="ghost"
                disabled={!next}
                onClick={() => next && setActiveCommentary(next.id)}
                className={cn(
                    "aspect-square p-1 w-auto h-auto rounded-full",
                    !next && "opacity-60 pointer-events-none"
                )}>
                <ChevronRightIcon className="w-6 h-6 hover:scale-110 transition-all" />
            </Button>
        </div>
    )
}
