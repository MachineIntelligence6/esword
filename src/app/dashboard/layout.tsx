import { ReactNode } from "react";
import DashboardSidebar from "./sidebar";
import DashboardHeader from "./header";
import { Metadata } from "next";
import AuthProvider from "@/components/auth-provider";



export const metadata: Metadata = {
    title: 'Dashboard - E-Sword',
    description: '',
}



export default function DashboardLayout({ children }: { children?: ReactNode }) {

    return (
        <AuthProvider>
            <div className="flex flex-col min-h-screen">
                <DashboardHeader />
                <div className="flex w-full min-h-screen">
                    <DashboardSidebar className="w-full max-w-[300px]" />
                    <div className="w-full p-10">
                        {children}
                    </div>
                </div>
            </div>
        </AuthProvider>
    )

}
