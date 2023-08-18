import BooksChapterComponent from "@/components/BooksChapterComponent";
import HeaderComponent from "@/components/HeaderComponent";
import {Accordion,AccordionContent,AccordionItem,AccordionTrigger,} from "@/components/ui/accordion"
import VersesContentComponent from "@/components/VersesContentComponent";
import CommentariesContentComponent from "@/components/CommentariesContentComponent";
import NotesContentComponent from "@/components/NotesContentComponent";



export default function HomePage() {
    return (
        <>
            <HeaderComponent />
            <div className="flex lg:flex-row flex-col max-h-screen lg:overflow-hidden  ">
                {/* Books and chapter component */}
                <div className="pt-[60px]">
                    <BooksChapterComponent />
                </div>
                <div className="md:pt-5 lg:pt-[60px]" >
                    <div className="lg:flex block w-full">
                        <div
                            className="flex flex-col xl:max-w-[70%] xl:min-w-[70%] lg:min-w-[60%] lg:max-w-[60%] w-full lg:border-r-[10px]">
                            <div className="flex mainDiv flex-col lg:h-auto w-auto">
                                {/* verses component for lg screen */}
                                <div className="hidden lg:block">
                                    <VersesContentComponent />
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
                                                <VersesContentComponent />
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </div>
                        </div>
                        <div className="xl:max-w-[30%] xl:min-w-[30%] lg:max-w-[40%] lg:min-w-[40%] max-h-full min-h-full" >
                            {/* Commentaries */}
                            <div className="hidden lg:block">
                                <CommentariesContentComponent />
                            </div>
                            {/* commentaries component for small screen */}
                            <div className="block lg:hidden">
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger className="toggle-btn bg-silver-light py-3 font-inter lg:pl-3 pl-[10px] pr-[19px] lg:border-0 border-b flex justify-between lg:hidden">
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
                            {/* Editor section */}
                            <div className="hidden lg:block">
                                <NotesContentComponent />
                            </div>
                            {/* Editor section for small screens */}
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
        </>
    )
}
