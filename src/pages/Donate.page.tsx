
import BooksChapterComponent from "@/components/BooksChapterComponent";
import HeaderComponent from "@/components/HeaderComponent";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";




export default function DonatePage() {



    return (
        <div>
            <HeaderComponent />
            <div className="flex lg:flex-row flex-col max-h-screen  pt-[60px]  overflow-hidden">

                <div className="">
                    <BooksChapterComponent />
                </div>
                <div className="w-full  justify-center  bg-primary">
                    <h3 className="text-xs font-bold py-3 lg:pl-3 px-[20px] lg:border-0 border-b  w-full bg-silver-light ">
                            Donate
                    </h3>
                    <div className="flex min-h-[calc(100vh_-_100px)] items-center justify-center border-t-2 border-silver-light w-full ">
                        <div
                            className="md:w-[446px] w-auto  h-auto flex flex-col items-center justify-center bg-white pt-10 rounded-lg mx-4">
                            <div>
                                <p className="font-bold text-2xl text-primary-dark">
                                    Donate to
                                </p>
                            </div>

                            <div className="pb-3">
                                <p className="font-normal text-base text-primary-dark">
                                    Hidden Sword
                                </p>
                            </div>
                            <hr className=" w-full border border-solid" />
                            <div className="py-2 md:px-0 px-4 text-center">
                                <p className="font-normal text-sm text-primary-dark">
                                    Thank you for supporting [org. name]. Lorem ipsum dolor imit
                                </p>
                            </div>
                            <div className="flex">
                                <img src="./images/$.svg" className="pt-5" />
                                <img src="./images/0.00.svg" className="pt-8" />

                            </div>
                            <div>
                                <p className="text-base text-primary-dark font-bold py-2">
                                    USD
                                </p>
                            </div>
                            <div className="flex items-center py-7 gap-x-1">
                                <Checkbox>

                                </Checkbox>

                                <p>
                                    Make this a monthly donation
                                </p>
                            </div>
                            <div className="mb-8 w-full px-8">
                                <Button>
                                    Donation with Paypal
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>

    )
}
