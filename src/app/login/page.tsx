import HeaderComponent from "@/components/frontend/HeaderComponent";
import LoginForm from "@/components/frontend/forms/login.form";
import { getServerAuth } from "@/server/auth";
import { redirect } from "next/navigation";



export default async function Page() {
    const session = await getServerAuth()
    if (session?.user) {
        return redirect(session.user.role === "VIEWER" ? "/" : "/dashboard")
    }

    return (
        <div className="overflow-hidden overflow-y-auto">
            {/* Header component */}
            <HeaderComponent />
            {/* Content */}
            <div className="bg-primary min-h-screen flex items-center justify-center  pt-5">
                <div className="">
                    <div
                        className="md:w-[446px] w-auto md h-auto flex flex-col items-center justify-center bg-white mx-4 md:mx-0 pt-10 rounded-lg">
                        <div>
                            <p className="font-inter font-bold text-2xl text-primary-dark">
                                Login with
                            </p>
                        </div>
                        <div className="flex justify-center  flex-col w-full py-3">
                            <div className="md:px-10 px-4">
                                <LoginForm />
                            </div>

                        </div>
                    </div>

                </div>
            </div>



        </div>
    )
}
