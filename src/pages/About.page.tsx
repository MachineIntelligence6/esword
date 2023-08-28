import BooksChapterComponent from "@/components/BooksChapterComponent";
import HeaderComponent from "@/components/HeaderComponent";
import { Card, CardContent, } from "@/components/ui/card";



export default function AboutUsPage() {
    return (
        <div  className="">
            <HeaderComponent />
            <div className="flex lg:flex-row flex-col  pt-[60px]">
                <div>
                    <BooksChapterComponent />
                </div>
                <div className="w-full  ">
                    <h3 className="text-xs font-bold py-3 lg:pl-3 px-5 lg:border-0 border-b  w-full bg-silver-light ">
                        ABOUT US
                    </h3>
                    <div className="bg-primary flex  justify-center p-7     md:max-h-[calc(100vh_-_100px)] md:min-h-[calc(100vh_-_100px)]">
                        <Card className="bg-white w-full overflow-auto  ">
                            <CardContent className="p-0 h-auto flex flex-col py-4 gap-4 md:gap-16 md:py-10 ">
                                <div className="flex flex-col  items-center  gap-3">
                                    <h1 className="font-roman text-2xl font-bold text-primary-dark text-center">
                                        About
                                    </h1>
                                    <hr className="w-full" />
                                    <p className="px-2 text-center text-primary-dark text-sm font-normal font-roman md:text-base md:w-[77%]">
                                        Many people have asked questions regarding the history of e-Sword, this ministry, who I am, etc. This page will hopefully answer some of those questions,
                                        as well as provide a time line of how GOD has blessed this effort.I (Rick Meyers) was born in 1962 in sunny southern California, saved by the grace of
                                        GOD in 1980, married my beautiful wife in 1988, and have two wonderful children—a daughter and son, in that order.<br />
                                        The Holy Spirit chose to give me the gift of teaching, which I have been using since 1991.<br />
                                        It was this same time that He gave me the desire to program computers (funny how that works).<br />
                                        Nine years later GOD combined my passion for His Word and my pleasure of programming, and e-Sword was birthed!
                                    </p>
                                   
                                </div>
                                <div className="flex flex-col  items-center  gap-3  ">
                                    <h1 className="font-roman text-2xl font-bold text-primary-dark text-center">
                                        History of sword
                                    </h1>
                                    <hr className="w-full" />
                                    <div className="px-2  text-primary-dark text-base font-normal flex gap-1 md:gap-2 md:w-[77%]" >
                                        <p className="text-light-green min-w-[60px] font-roman ">
                                            jan.2000
                                        </p>
                                        <p className="font-roman ">
                                            The first lines of code for e-Sword are written. e-Sword is birthed with a clear vision of user interface and study approach: keep it simple and do the obvious!
                                        </p>
                                    </div>
                                    <div className="px-2 text-primary-dark text-base font-normal  flex gap-2 md:w-[77%]" >
                                        <p className="text-light-green min-w-[60px] font-roman ">
                                            apr, 2000
                                        </p>
                                        <p className="font-roman ">
                                            e-Sword version 1.0 is released, complete with its unique user interface layout, popup ToolTips, Study Notes editor, verse comparison, and synchronized
                                        </p>
                                    </div>
                                    <div className="px-2 text-primary-dark text-base font-normal  flex gap-2 md:w-[77%]" >
                                        <p className="text-light-green min-w-[60px] font-roman ">
                                            apr, 2000
                                        </p>
                                        <p className="font-roman ">
                                            e-Sword version 1.0 is released, complete with its unique user interface layout, popup ToolTips, Study Notes editor, verse comparison, and synchronized
                                        </p>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div >
    )
}