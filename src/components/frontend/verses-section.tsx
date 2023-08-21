'use client'
import { useRef, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useReadBookStore } from "@/lib/zustand/readBookStore";
import Link from "next/link";
import { IChapter, IVerse } from "@/shared/types/models.types";
import { cn } from "@/lib/utils";
import { TopicLoadingPlaceholder, VersesLoadingPlaceholder } from "../loading-placeholders";
import Image from "next/image";
import { BookmarkIcon, ChevronLeftIcon, ChevronRightIcon, FaceIcon, FileTextIcon, ImageIcon, PinLeftIcon, PlayIcon, SunIcon, ZoomInIcon, ZoomOutIcon } from "@radix-ui/react-icons";






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
                            <AccordionTrigger className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 pl-[10px] pr-[19px] lg:border-0 border-b flex justify-between">
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
        booksList, chaptersList, activeVerse,
        setActiveChapter
    } = useReadBookStore()

    const activeChIndex = chaptersList?.findIndex((ch) => ch.id === activeChapter.id) ?? -1;
    const previousChapter = (activeChIndex !== -1 && chaptersList && activeChIndex > 0) ? chaptersList[activeChIndex - 1] : undefined;
    let nextChapter: IChapter | undefined
    if (activeChIndex != -1 && chaptersList && ((activeChIndex + 1) < chaptersList.length)) {
        nextChapter = chaptersList[activeChIndex + 1]
    }

    const toggleHighlight = (): void => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return;
        }
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.className = 'highlight bg-yellow-200';
        const isHighlighted = range.commonAncestorContainer.parentElement?.classList.contains('highlight');
        if (isHighlighted) {
            const parentElement = range.commonAncestorContainer.parentElement;
            if (parentElement) {
                parentElement.outerHTML = parentElement.innerHTML;
            }
        } else {
            range.surroundContents(span);
        }

        selection.removeAllRanges();
    };
    const [scale, setScale] = useState(1);

    const handleZoomIn = () => {
        setScale((prevScale) => Math.min(1.6, prevScale + 0.1));  // Increase scale by 0.1
    };
    const handleZoomOut = () => {
        setScale((prevScale) => Math.max(0.6, prevScale - 0.1)); // Decrease scale by 0.1 but never below 0.1
    };


    const goToNextChapter = () => {
        if (!nextChapter) return;
        setActiveChapter(nextChapter.id)
    }
    const goToPrevChapter = () => {
        if (!previousChapter) return;
        setActiveChapter(previousChapter.id)
    }


    const highlightRef = useRef(null);

    const showPlaceholder = initialLoading || activeBook.loading || activeChapter.loading || activeVerse.loading || !booksList || !chaptersList;
    return (
        <>
            {/* title */}
            <div className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 px-[10px] lg:border-0 border-b  justify-between  hidden lg:flex">
                <h3 className="text-xs font-bold">
                    VERSES
                </h3>
            </div>
            <div className="block expanable-content lg-open ">
                {/* buttons tab */}
                <div className="lg:flex block justify-between lg:border-b min-h-[39px] max-h-[39px]">
                    <div className="flex xl:gap-x-12 lg:gap-x-3 md:w-full lg:w-auto lg:pr-7 lg:border-0 border-b lg:px-1 px-5 xl:px-6 justify-between items-center py-2">
                        <button disabled>
                            <PlayIcon width={22} height={22} />
                        </button>
                        <div data-orientation="vertical" role="none" className="shrink-0 bg-slate-200 w-[1px] h-5" />
                        <button
                            type="button"
                            className="highlighter"
                            disabled={(!topicsList || topicsList.length <= 0)}
                            onClick={toggleHighlight}>
                            <Image width={18} height={18} src="./images/ph_text-aa-fill.svg" alt="Highlight" />
                        </button>
                        <button
                            type="button"
                            disabled={(!topicsList || topicsList.length <= 0)}>
                            <BookmarkIcon className="w-5 h-5 text-gray-500" />
                        </button>
                        <div data-orientation="vertical" role="none" className="shrink-0 bg-slate-200 w-[1px] h-5" />
                        <button
                            type="button"
                            className="zoom-in"
                            disabled={(!topicsList || topicsList.length <= 0)}
                            onClick={handleZoomIn}>
                            <ZoomInIcon width={22} height={22} />
                        </button>
                        <button
                            type="button"
                            className="zoom-out disabled:opacity-60"
                            disabled={(scale <= 1) || (!topicsList || topicsList.length <= 0)} onClick={handleZoomOut}>
                            <ZoomOutIcon width={22} height={22} />
                        </button>
                        <div data-orientation="vertical" role="none" className="shrink-0 bg-slate-200 w-[1px] h-5" />
                        <button
                            type="button"
                            className=""
                            disabled={!previousChapter}
                            onClick={goToPrevChapter}>
                            <ChevronLeftIcon width={22} height={22} />
                        </button>
                        <button
                            type="button"
                            className=""
                            disabled={!nextChapter}
                            onClick={goToNextChapter}>
                            <ChevronRightIcon width={22} height={22} />
                        </button>
                    </div>
                </div>
                {/* content */}
                <div className="flex lg:mt-0 mt-[10px] max-w-full  max-h-screen overflow-hidden lg:max-h-[calc(100vh_-_150px)]" ref={highlightRef}>
                    <div className=" py-10 max-h-[100vh] w-full max-w-full overflow-auto">
                        <div className="min-h-full bg-white space-y-8" style={{ transform: `scale(${scale}) ` }}>
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
                                                        <h1 className="font-bold text-center text-xl text-primary-dark">
                                                            {topic.name}
                                                        </h1>
                                                    </div>
                                                    <div className="flex flex-col gap-y-[10px]">
                                                        <div className="flex">
                                                            <div className="flex flex-col gap-y-[10px] px-5">
                                                                {
                                                                    topic.verses?.map((verse) => (
                                                                        <VerseComponent
                                                                            key={verse.id}
                                                                            verse={verse}
                                                                            onClick={() => setActiveVerse(verse.id, topic.id)} />
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
                    <div className="flex flex-col gap-4 pt-3 px-2 w-10 overflow-y-auto">
                        <Link href="">
                            <Image width={15} height={15} alt="" src="/icons/bookfill-icon.png " className="bookmark" />
                        </Link>
                        <Link href="">
                            <Image width={15} height={15} alt="" src="/icons/bookfill-icon.png " className="bookmark" />
                        </Link>
                        <Link href="">
                            <Image width={15} height={15} alt="" src="/icons/bookfill-icon.png " className="bookmark" />
                        </Link>
                        <Link href="">
                            <Image width={15} height={15} alt="" src="/icons/bookfill-icon.png " className="bookmark" />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}


type VerseComponentProps = {
    onClick?: () => void;
    verse: IVerse;
}

function VerseComponent({ verse, onClick }: VerseComponentProps) {
    const { activeVerse, setActiveVerse } = useReadBookStore()

    return (
        <div
            className={cn(
                "flex font-normal gap-5 transition-all duration-200",
                activeVerse.id === verse.id && "font-bold"
            )}
            onClick={onClick}>
            <p className={"text-base text-light-green min-w-max"}>
                {`${verse.topic?.chapter?.book?.abbreviation} ${verse.topic?.chapter?.name}:${verse.number}`}
            </p>
            <p className={"text-base text-primary-dark"}>
                {verse.text}
            </p>
        </div>
    )
}