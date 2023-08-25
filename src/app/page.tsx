'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion"
import CommentariesContentComponent from "@/components/frontend/commentaries-section";
import NotesContentComponent from "@/components/frontend/notes-section";
import { useReadBookStore } from "@/lib/zustand/readBookStore";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { VersesSection } from "@/components/frontend/verses-section";
import SiteSidebar from "@/app/sidebar";



export default function Page() {
    const searchParams = useSearchParams()
    const { booksList, chaptersList, loadInitialData } = useReadBookStore()


    const doInitialLoadWork = async () => {
        const book = searchParams.get("book") ?? undefined
        const chapter = parseInt(searchParams.get("chapter") ?? "-1")
        const verse = parseInt(searchParams.get("verse") ?? "-1")
        await loadInitialData(
            book,
            chapter === -1 ? undefined : chapter,
            verse === -1 ? undefined : verse,
        )
    }

    useEffect(() => {
        if (booksList && chaptersList) return;
        doInitialLoadWork()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])



    return (
        <div className="">
            <div className="flex lg:flex-row flex-col max-h-screen lg:overflow-hidden">
                {/* Books and chapter component */}
                <SiteSidebar />
                <div className="w-full" >
                    <div className="lg:flex block w-full">
                        <VersesSection />
                        <div className="xl:max-w-[30%] xl:min-w-[30%] lg:max-w-[40%] lg:min-w-[40%] max-h-full min-h-full lg:flex  lg:flex-col" >
                            {/* Commentaries */}
                            <div className="w-full h-1/2">
                                <div className="hidden lg:block">
                                    <CommentariesContentComponent />
                                </div>
                                {/* commentaries component for small screen */}
                                <div className="block lg:hidden">
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger className="toggle-btn bg-silver-light py-3 lg:pl-3 pl-[10px] pr-[19px] lg:border-0 border-b flex justify-between lg:hidden">
                                                <h3 className="text-xs font-bold">
                                                    COMMENTARIES
                                                </h3>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <CommentariesContentComponent />
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </div>

                            <div className="w-full">
                                <div className="hidden lg:block h-full">
                                    <NotesContentComponent />
                                </div>
                                <div>
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 pl-[10px] pr-[19px] lg:border-0 border-b flex justify-between lg:hidden">
                                                <h3 className="text-xs font-bold">
                                                    NOTES
                                                </h3>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <NotesContentComponent />
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
