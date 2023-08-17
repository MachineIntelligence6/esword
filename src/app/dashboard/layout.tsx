
import { ReactNode } from "react";
import DashboardSidebar from "./sidebar";
import DashboardHeader from "./header";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import {  getServerAuth } from "@/server/auth";



export const metadata: Metadata = {
    title: 'Dashboard - E-Sword',
    description: '',
}



export default async function DashboardLayout({ children }: { children?: ReactNode }) {
    const session = await getServerAuth()
    if (!session) return redirect("/login");

    return (
        <div className="flex flex-col min-h-screen">
            <DashboardHeader session={session} />
            <div className="flex w-full min-h-screen">
                <DashboardSidebar session={session} className="w-full max-w-[300px]" />
                <div className="w-full p-10">
                    {children}
                </div>
            </div>
        </div>
    )

}
