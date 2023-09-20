import LoginForm from "@/components/frontend/forms/login.form";
import { getServerAuth } from "@/server/auth";
import { redirect } from "next/navigation";



export default async function Page() {
    const session = await getServerAuth()
    if (typeof session !== "boolean" && session?.user) {
        return redirect(session.user.role === "VIEWER" ? "/" : "/dashboard")
    }

    return (
        <div className="overflow-hidden overflow-y-auto">
            <div className="bg-primary min-h-[calc(100vh_-_70px)] flex items-center justify-center pt-5 px-5">
                <div className="w-full max-w-lg bg-white pt-10 rounded-lg">
                    <h3 className="font-inter font-bold text-2xl text-primary-dark text-center">
                        Login with
                    </h3>
                    <div className="flex justify-center  flex-col w-full py-3">
                        <div className="md:px-10 px-5 w-full">
                            <LoginForm />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
