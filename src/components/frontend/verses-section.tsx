'use client'
import { RefObject, useEffect, useRef, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useReadBookStore } from "@/lib/zustand/readBookStore";
import { IBookmark, IChapter, IHighlight, IVerse } from "@/shared/types/models.types";
import { cn } from "@/lib/utils";
import { BookmarksLoadingPlaceholder, TopicLoadingPlaceholder, VersesLoadingPlaceholder } from "../loading-placeholders";
import Image from "next/image";
import { BookmarkIcon, ChevronLeftIcon, ChevronRightIcon, EyeOpenIcon, PlayIcon, TrashIcon, ZoomInIcon, ZoomOutIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "../ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import Spinner from "../spinner";
import Highlighter from "react-highlight-words";
import { Separator } from "../ui/separator";
import BookmarksList from "./bookmarks-list";





export function VersesSection() {
    return (
        <div className="flex flex-col xl:max-w-[70%] xl:min-w-[70%] lg:min-w-[60%] lg:max-w-[60%] w-full lg:border-r-[10px]">
            <div className="flex mainDiv flex-col lg:h-auto w-auto">
                {/* verses component for lg screen */}
                <div className="hidden lg:block">
                    <VersesSectionContent />
                </div>
                {/* verses component for small screen */}
                <div className="block lg:hidden">
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="toggle-btn bg-silver-light py-3  lg:pl-3 pl-[20px] pr-[19px] lg:border-0 border-b flex justify-between">
                                <h3 className="text-xs font-bold">
                                    VERSES
                                </h3>
                            </AccordionTrigger>
                            <AccordionContent>
                                <VersesSectionContent />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    )
}


function VersesSectionContent() {
    const {
        topicsList, setActiveVerse, activeChapter,
        activeBook, initialLoading,
        booksList, chaptersList, createNewBookmark,
        setActiveChapter, activeVerse, saveHighlight
    } = useReadBookStore()
    const versesContainerRef = useRef<HTMLDivElement>(null)

    const activeChIndex = chaptersList?.findIndex((ch) => ch.id === activeChapter.id) ?? -1;
    const previousChapter = (activeChIndex !== -1 && chaptersList && activeChIndex > 0) ? chaptersList[activeChIndex - 1] : undefined;
    let nextChapter: IChapter | undefined
    if (activeChIndex != -1 && chaptersList && ((activeChIndex + 1) < chaptersList.length)) {
        nextChapter = chaptersList[activeChIndex + 1]
    }


    const toggleHighlight = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return;
        }
        const selectionEl = selection?.anchorNode?.parentElement?.parentElement?.parentElement
        const elId = selectionEl?.id
        const verseId = elId && elId.startsWith("verse_") ? Number(elId.split("_")[1]) : -1
        if (verseId !== -1 && verseId === activeVerse.id) saveHighlight(verseId, selection.toString())

        selection.removeAllRanges();
    };
    const [scale, setScale] = useState(1);

    const handleZoomIn = () => {
        setScale((prevScale) => Math.min(2, prevScale + 0.2));  // Increase scale by 0.1
    };
    const handleZoomOut = () => {
        setScale((prevScale) => Math.max(1, prevScale - 0.2)); // Decrease scale by 0.1 but never below 0.1
    };


    const goToNextChapter = () => {
        if (!nextChapter) return;
        setActiveChapter(nextChapter.id)
    }
    const goToPrevChapter = () => {
        if (!previousChapter) return;
        setActiveChapter(previousChapter.id)
    }


    const showPlaceholder = initialLoading || activeBook.loading || activeChapter.loading || !booksList || !chaptersList;
    return (
        <>
            {/* title */}
            <div className="toggle-btn bg-silver-light py-3 lg:pl-3 px-[10px] lg:border-0 border-b  justify-between  hidden lg:flex">
                <h3 className="text-xs font-bold">
                    VERSES
                </h3>
            </div>
            <div className="block">
                {/* buttons tab */}
                <div className="lg:flex block justify-between lg:border-b min-h-[39px] max-h-[39px]">
                    <div className="flex xl:gap-x-12 lg:gap-x-3 md:w-full lg:w-auto lg:pr-7 lg:border-0 border-b lg:px-1 px-5 xl:px-6 justify-between items-center py-2">
                        <button
                            disabled
                            className="hover:scale-110 transition-all disabled:hover:!scale-100">
                            <PlayIcon className="w-5 h-5" />
                        </button>
                        <Separator orientation="vertical" className="h-5" />
                        <button
                            type="button"
                            className="hover:scale-110 transition-all disabled:hover:!scale-100"
                            disabled={(!topicsList || topicsList.length <= 0)}
                            onClick={toggleHighlight}>
                            <Image width={18} height={18} src="./images/ph_text-aa-fill.svg" alt="Highlight" />
                        </button>
                        <button
                            type="button" className="hover:scale-110 transition-all disabled:hover:!scale-100"
                            disabled={(!topicsList || topicsList.length <= 0) || !activeVerse.data}
                            onClick={() => createNewBookmark(activeVerse.data ?? undefined)}>
                            <BookmarkIcon className="w-5 h-5" />
                        </button>
                        <Separator orientation="vertical" className="h-5" />
                        <button
                            type="button"
                            className="zoom-in hover:scale-110 transition-all disabled:hover:!scale-100"
                            disabled={(!topicsList || topicsList.length <= 0 || scale >= 2)}
                            onClick={handleZoomIn}>
                            <ZoomInIcon className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            className="zoom-out disabled:opacity-60 hover:scale-110 transition-all disabled:hover:!scale-100"
                            disabled={(scale <= 1) || (!topicsList || topicsList.length <= 0)} onClick={handleZoomOut}>
                            <ZoomOutIcon className="w-5 h-5" />
                        </button>
                        <Separator orientation="vertical" className="h-5" />
                        <button
                            type="button"
                            className="hover:scale-110 transition-transform disabled:hover:!scale-100"
                            disabled={!previousChapter}
                            onClick={goToPrevChapter}>
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            className="hover:scale-110 transition-transform disabled:hover:!scale-100"
                            disabled={!nextChapter}
                            onClick={goToNextChapter}>
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                {/* content */}
                <div className="flex lg:mt-0 mt-[10px] max-w-full  max-h-screen overflow-hidden lg:max-h-[calc(100vh_-_150px)]">
                    <div ref={versesContainerRef} className=" pb-10 pt-2 max-h-[100vh] w-full max-w-full overflow-auto">
                        <div className="min-h-full bg-white space-y-5" style={{ transform: `scale(${scale}) `, transformOrigin: "top left" }}>
                            {
                                showPlaceholder ?
                                    <div className="flex flex-col  h-full">
                                        <div className="flex items-center justify-center flex-col">
                                            <TopicLoadingPlaceholder />
                                            <VersesLoadingPlaceholder />
                                        </div>
                                        <div className="flex items-center justify-center flex-col">
                                            <TopicLoadingPlaceholder />
                                            <VersesLoadingPlaceholder />
                                        </div>
                                    </div>
                                    :
                                    (
                                        topicsList && topicsList.length > 0 ?
                                            topicsList?.map((topic) => (
                                                <div key={topic.id}>
                                                    <div className="flex items-center justify-center py-[10px]">
                                                        <h1 className="font-bold text-center text-base text-primary-dark font-roman md:text-xl">
                                                            {topic.name}
                                                        </h1>
                                                    </div>
                                                    <div className="flex flex-col gap-y-[10px]">
                                                        <div className="flex">
                                                            <div className="flex flex-col gap-y-[10px] px-5 font-roman">
                                                                {
                                                                    topic.verses?.map((verse) => (
                                                                        <VerseComponent
                                                                            key={verse.id}
                                                                            verse={verse}
                                                                            versesContainerRef={versesContainerRef}
                                                                            active={activeVerse.id === verse.id}
                                                                            onClick={() => setActiveVerse(verse.id)} />
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                            :
                                            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
                                                <p className="font-medium">No verses.</p>
                                            </div>
                                    )
                            }
                        </div>
                    </div>
                    {/* bookmark icons section */}
                    <BookmarksList />
                </div>
            </div>
        </>
    )
}







const generateRegexPattern = (text: string, index: number) => {
    const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape any regex special characters
    return `(?:\\b${escapedText}\\b\\W*){${index}}\\b${escapedText}\\b`;
};


type VerseComponentProps = {
    onClick?: () => void;
    verse: IVerse;
    active?: boolean;
    versesContainerRef: RefObject<HTMLDivElement>
}

function VerseComponent({ verse, onClick, active, versesContainerRef }: VerseComponentProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { activeBookmark } = useReadBookStore()

    const scrollToItem = () => {
        if (!versesContainerRef.current || !ref.current) return;
        versesContainerRef.current.scrollTop = ref.current.offsetTop
    }

    useEffect(() => {
        if (active && activeBookmark) scrollToItem()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, activeBookmark])



    const findChunksForHighlight = (textToHighlight: string, highlight: IHighlight) => {
        const { text, index } = highlight;
        const regex = new RegExp(generateRegexPattern(text, index), 'g');
        const matches = textToHighlight.match(regex);

        if (matches) {
            return matches.map((match) => {
                const startIndex = textToHighlight.indexOf(match);
                return { start: startIndex, end: startIndex + text.length };
            });
        }

        return [];
    };

    const allChunks: { start: number, end: number }[] = [];

    verse.highlights?.forEach((highlight) => {
        const chunks = findChunksForHighlight(verse.text, highlight);
        allChunks.push(...chunks);
    });


    return (
        <div id={`verse_${verse.id}`} ref={ref}
            className={cn(
                "flex font-normal gap-5 transition-all duration-200",
                active ? "font-bold" : "select-none"
            )}
            onClick={onClick}>
            <p className={"text-sm text-light-green min-w-max md:text-base"}>
                {`${verse.topic?.chapter?.book?.abbreviation} ${verse.topic?.chapter?.name}:${verse.number}`}
            </p>
            <Highlighter
                searchWords={verse.highlights?.map((h) => h.text) ?? []}
                autoEscape caseSensitive
                textToHighlight={verse.text}
                // highlightTag={Highlight}
                activeClassName=""
                className="text-sm text-primary-dark md:text-base"
            // findChunks={() => allChunks}
            />
            {/* <p className={""}>
                 {verse.text}
             </p> */}
        </div>
    )
}