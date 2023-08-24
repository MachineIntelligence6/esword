import BooksChapterComponent from "@/components/BooksChapterComponent";
import HeaderComponent from "@/components/HeaderComponent";
import { Card, CardContent, CardFooter, CardTitle, } from "@/components/ui/card";





export default function BlogsPage() {
    return (
        <div>
            <HeaderComponent />
            <div className="flex lg:flex-row flex-col max-h-screen overflow-auto pt-[60px] ">

                <div className="">
                    <BooksChapterComponent />
                </div>

                <div className="w-full ">
                    <h3 className="text-xs font-bold py-3 font-inter lg:pl-3 px-[10px] lg:border-0 border-b  w-full bg-silver-light ">
                        Menu Script
                    </h3>
                    <Card className="mx-5 my-5 bg-white"   >
                        <CardContent>
                            
                        </CardContent>
                        {/* <CardFooter>
                            <span >
                                {
                                    `Discover where art and AI collide as visionary artist Hagen Pietsch unveils his inaugural NFT collection, "RoboMetamorphs”, a eamless integration of AI-generated imagery and animation, as delightful little robots gracefully transform into captivating forms, showcasing the ever-evolving nature of AI technology`.substring(0, 250)
                                }
                                <span>...</span>
                            </span>
                        </CardFooter> */}
                    </Card>
                    

                </div>

            </div>
        </div>
    )
}