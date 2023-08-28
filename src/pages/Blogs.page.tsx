import BlogsContent from "@/components/BlogsComponent";
import BooksChapterComponent from "@/components/BooksChapterComponent";
import HeaderComponent from "@/components/HeaderComponent";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";



export default function BlogsPage() {
    return (
        <div className="">
            <HeaderComponent />
            <div className="flex lg:flex-row flex-col max-h-screen  pt-[60px] w-full  ">
                <div className="">
                    <BooksChapterComponent />
                </div>
                <div className="w-full bg-white">
                   <div className="lg:grid grid-cols-11 ">
                        <div className="block bg-primary lg:hidden">
                            <Accordion type="single" collapsible >
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className=" bg-silver-light py-3 font-inter lg:pl-3 pl-5 pr-[19px] flex justify-between w-full border-b-2">
                                        <h3 className="text-xs font-bold capitalize">
                                            MANUSCRIPT
                                        </h3>
                                        <ChevronDownIcon className="h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200 dark:text-stone-400 " />
                                    </AccordionTrigger>
                                    <AccordionContent className="p-5 overflow-auto max-h-[calc(100vh_-_500px)]">
                                        <BlogsContent />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                        <h3 className="text-xs font-bold py-3 lg:pl-3 px-5 lg:px-[10px]  border-r-2 w-full bg-silver-light col-span-7 capitalize " >
                            THE CREATION OF WORLD
                        </h3>
                        <h3 className="text-xs font-bold py-3 lg:pl-3 px-5 lg:px-[10px] lg:border-0 border-b w-full bg-silver-light col-span-4 lg:block capitalize hidden">
                            MANUSCRIPT
                        </h3>
                    </div>
                    <div className="lg:grid grid-cols-11 ">
                        <div className="col-span-7 w-full p-5  text-primary-dark text-base font-normal font-roman   max-h-[calc(100vh_-_100px)] overflow-auto">
                            <div className="space-y-3">
                                <p>
                                    All beginnings must begin with God. Always put I for trotoite teat tons no the has an end first thought every morning, the first aim and 4 purpose of all activity. Bein the took tree year with God, and you will end it with the glory of the New Jerusalem. At first, as in the physical creation,  and life may seem to be "without form and void." Do not be discouraged, the Spirit of God is within you,  amid the darkness, and presently His Light will shine through. 
                                </p>
                                <p>
                                    All beginnings must begin with God. Always put I for trotoite teat tons no the has an end first thought every morning, the first aim and 4 purpose of all activity. Bein the took tree year with God, and you will end it with the glory of the New Jerusalem. At first, as in the physical creation,  and life may seem to be "without form and void." Do not be discouraged, the Spirit of God is within you,  amid the darkness, and presently His Light will shine through. 
                                </p>
                                <p>
                                    All beginnings must begin with God. Always put I for trotoite teat tons no the has an end first thought every morning, the first aim and 4 purpose of all activity. Bein the took tree year with God, and you will end it with the glory of the New Jerusalem. At first, as in the physical creation,  and life may seem to be "without form and void." Do not be discouraged, the Spirit of God is within you,  amid the darkness, and presently His Light will shine through. 
                                </p>
                                <p>
                                    All beginnings must begin with God. Always put I for trotoite teat tons no the has an end first thought every morning, the first aim and 4 purpose of all activity. Bein the took tree year with God, and you will end it with the glory of the New Jerusalem. At first, as in the physical creation,  and life may seem to be "without form and void." Do not be discouraged, the Spirit of God is within you,  amid the darkness, and presently His Light will shine through. 
                                </p>
                                <p>
                                    All beginnings must begin with God. Always put I for trotoite teat tons no the has an end first thought every morning, the first aim and 4 purpose of all activity. Bein the took tree year with God, and you will end it with the glory of the New Jerusalem. At first, as in the physical creation,  and life may seem to be "without form and void." Do not be discouraged, the Spirit of God is within you,  amid the darkness, and presently His Light will shine through. 
                                </p>
                            </div>

                        </div>
                        <div className="col-span-4 bg-primary p-5 space-y-4  lg:block hidden overflow-auto  min-h-[calc(100vh_-_100px)] max-h-[calc(100vh_-_100px)]">
                                <BlogsContent />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}






