'use client'
import { ReactNode } from "react";
import DashboardSidebar, { menuItems } from "./sidebar";
import { usePathname } from "next/navigation";
import { Metadata } from "next";



export const metadata: Metadata = {
    title: 'Dashboard - E-Sword',
    description: '',
}



export default function DashboardLayout({ children }: { children?: ReactNode }) {
    const pathname = usePathname()

    const currentMenuItem = menuItems.find((menuItem) => pathname === (menuItem.path))

    return (
        <div className="flex w-full">
            <DashboardSidebar className="w-full max-w-[300px]" />
            <div className="w-full p-10">
                {children}
            </div>
        </div>
    )

}
