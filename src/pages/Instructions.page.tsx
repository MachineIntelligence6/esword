import HeaderComponent from "@/components/HeaderComponent";




export default function InstructionsPage() {



    return (
        <>
        {/* Header component */}
            <HeaderComponent />
            {/* content */}
            <div className="bg-primary min-h-screen flex items-center justify-center  pt-[60px] ">
                <div className="bg-white md:w-[446px] w-full flex items-center justify-center flex-col border rounded-xl md:mx-0 mx-4">
                    <div className="rounded-full pt-11 pb-[10px]">
                        <img src="/images/email-instructions.svg" alt="" />
                    </div>
                    <div className="flex items-center justify-center text-center">
                        <p className="text-primary-dark font-inter font-bold text-2xl py-[10px] md:px-0 px-10">
                            Instructions sent to your email!
                        </p>
                    </div>
                    <div className="flex items-center justify-center text-center">
                        <p className="text-primary-dark font-normal text-sm md:pb-16 pb-11 md:px-20 px-8">
                            We have sent the instructions to your email. lorem ipsum dolor imit lorem ipsum
                        </p>
                    </div>
                </div>
            </div>



        </>

    )
}
