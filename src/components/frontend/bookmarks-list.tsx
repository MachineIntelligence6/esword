"use client";
import { useState } from "react";
import { useToast } from "../ui/use-toast";
import { IBookmark } from "@/shared/types/models.types";
import { useReadBookStore } from "@/lib/zustand/readBookStore";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import Image from "next/image";
import { Button } from "../ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeOpenIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import Spinner from "../spinner";
import { BookmarksLoadingPlaceholder } from "../loading-placeholders";
import clientApiHandlers from "@/client/handlers";
import definedMessages from "@/shared/constants/messages";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function BookmarksList() {
  const pathname = usePathname();
  const router = useRouter();
  const [showBookmarks, setShowBookmarks] = useState(false);
  const toggleBookmarks = () => {
    setShowBookmarks((prevShowBookmarks) => !prevShowBookmarks);
  };
  const {
    bookmarksList,
    setActiveBookmark,
    loadBookmarks,
    initialLoading,
    booksList,
    chaptersList,
    activeChapter,
  } = useReadBookStore();
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleSetActiveBookmark = (bookmark: IBookmark) => {
    setActiveBookmark(bookmark);
    if (pathname !== "/" && bookmark.verse?.topic?.chapter?.book) {
      router.push(
        `/?book=${bookmark.verse.topic.chapter.book.slug}&chapter=${bookmark.verse.topic.chapter.name}&verse=${bookmark.verse.number}`
      );
    }
  };
  const handleDeleteBookmark = async (bookmark: IBookmark) => {
    setProcessing(true);
    const res = await clientApiHandlers.bookmarks.archive(bookmark.id);
    if (res.succeed) {
      toast({
        title: "Bookmark deleted successfully.",
      });
      loadBookmarks();
    } else {
      toast({
        title: "Error",
        description: definedMessages.UNKNOWN_ERROR,
        variant: "destructive",
      });
    }
    setProcessing(false);
  };

  return (
    <div>
      <div className="block lg:hidden">
        {showBookmarks ? (
          <ChevronRightIcon
            onClick={toggleBookmarks}
            className="cursor-pointer"
          />
        ) : (
          <ChevronLeftIcon
            onClick={toggleBookmarks}
            className="cursor-pointer"
          />
        )}
      </div>

      <div className={cn(showBookmarks ? "block" : "hidden lg:block")}>
        {bookmarksList &&
        booksList &&
        chaptersList &&
        !initialLoading &&
        !activeChapter.loading ? (
          bookmarksList.length > 0 && (
            <div className="flex flex-col w-10 gap-4 px-2 pt-3 overflow-y-auto">
              {bookmarksList?.map((bookmark) => (
                <HoverCard key={bookmark.id} openDelay={10}>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      disabled={processing}
                      className="h-auto p-0 transition-all hover:scale-110"
                      onClick={() => handleSetActiveBookmark(bookmark)}
                    >
                      <Image
                        width={15}
                        height={15}
                        alt=""
                        src="/icons/bookfill-icon.png "
                      />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="p-5 w-80">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">
                          Bookmark Details
                        </h4>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            onClick={() => handleSetActiveBookmark(bookmark)}
                            disabled={processing}
                            variant="outline"
                            size="xs"
                          >
                            <EyeOpenIcon />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="xs"
                            disabled={processing}
                            onClick={() => handleDeleteBookmark(bookmark)}
                          >
                            {processing ? (
                              <Spinner className="w-4 h-4 border-white" />
                            ) : (
                              <TrashIcon />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="w-full mt-5 space-y-2">
                        <div className="flex items-center justify-between gap-5 text-xs">
                          <span className="block w-16">Book : </span>
                          <span className="font-bold">
                            {bookmark.verse?.topic?.chapter?.book?.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-5 text-xs">
                          <span className="block w-16">Chapter : </span>
                          <span className="font-bold">
                            {bookmark.verse?.topic?.chapter?.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-5 text-xs">
                          <span className="block w-16">Verse : </span>
                          <span className="font-bold">
                            {bookmark.verse?.number}
                          </span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          )
        ) : (
          <div className="w-10 h-full">
            <BookmarksLoadingPlaceholder />
          </div>
        )}
      </div>
    </div>
  );
}
