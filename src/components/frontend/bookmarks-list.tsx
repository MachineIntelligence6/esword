import { useState } from "react";
import { useToast } from "../ui/use-toast";
import { IBookmark } from "@/shared/types/models.types";
import { useReadBookStore } from "@/lib/zustand/readBookStore";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import Image from "next/image";
import { Button } from "../ui/button";
import { EyeOpenIcon, TrashIcon } from "@radix-ui/react-icons";
import Spinner from "../spinner";
import { BookmarksLoadingPlaceholder } from "../loading-placeholders";
import clientApiHandlers from "@/client/handlers";
import definedMessages from "@/shared/constants/messages";

export default function BookmarksList() {
    const { bookmarksList, setActiveBookmark, loadBookmarks, initialLoading, booksList, chaptersList, activeChapter } = useReadBookStore()
    const [processing, setProcessing] = useState(false);
    const { toast } = useToast();

    const handleSetActiveBookmark = (bookmark: IBookmark) => {
        setActiveBookmark(bookmark)
    }
    const handleDeleteBookmark = async (bookmark: IBookmark) => {
        setProcessing(true);
        const res = await clientApiHandlers.bookmarks.archive(bookmark.id)
        if (res.succeed) {
            toast({
                title: "Bookmark deleted successfully."
            })
            loadBookmarks()
        } else {
            toast({
                title: "Error",
                description: definedMessages.UNKNOWN_ERROR,
                variant: "destructive"
            })
        }
        setProcessing(false)
    }

    return (
        <>
            {
                bookmarksList && booksList && chaptersList && !initialLoading && !activeChapter.loading ?
                    bookmarksList.length > 0 &&
                    <div className="flex flex-col gap-4 pt-3 px-2 w-10 overflow-y-auto">
                        {
                            bookmarksList?.map((bookmark) => (
                                <HoverCard key={bookmark.id} openDelay={10}>
                                    <HoverCardTrigger asChild>
                                        <button
                                            type="button"
                                            disabled={processing}
                                            className="p-0 h-auto hover:scale-110 transition-all"
                                            onClick={() => handleSetActiveBookmark(bookmark)}>
                                            <Image width={15} height={15} alt="" src="/icons/bookfill-icon.png " />
                                        </button>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80 p-5">
                                        <div className="flex flex-col">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold">Bookmark Details</h4>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleSetActiveBookmark(bookmark)}
                                                        disabled={processing}
                                                        variant="outline" size="xs">
                                                        <EyeOpenIcon />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive" size="xs"
                                                        disabled={processing}
                                                        onClick={() => handleDeleteBookmark(bookmark)}>
                                                        {
                                                            processing ?
                                                                <Spinner className="w-4 h-4 border-white" />
                                                                : <TrashIcon />
                                                        }
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2 mt-5 w-full">
                                                <div className="flex items-center justify-between gap-5 text-xs">
                                                    <span className="block w-16">Book : </span>
                                                    <span className="font-bold">{bookmark.verse?.topic?.chapter?.book?.name}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-5 text-xs">
                                                    <span className="block w-16">Chapter : </span>
                                                    <span className="font-bold">{bookmark.verse?.topic?.chapter?.name}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-5 text-xs">
                                                    <span className="block w-16">Verse : </span>
                                                    <span className="font-bold">{bookmark.verse?.number}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>
                            ))
                        }
                    </div>
                    :
                    <div className="w-10 h-full">
                        <BookmarksLoadingPlaceholder />
                    </div>
            }
        </>

    )
}

