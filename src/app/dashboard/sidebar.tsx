'use client'
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname } from 'next/navigation'
import Link from "next/link";
import { canUserAccessPath } from "@/lib/roles-manager";
import { Session } from "next-auth";
import { Cross1Icon, TextAlignJustifyIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSidebarStore } from "@/lib/zustand/sidebarStore";


type MenuItem = {
    path: string;
    label: string;
}


export const menuItems: Array<MenuItem> = [
    {
        path: "/dashboard",
        label: "Dashboard"
    },
    {
        path: "/dashboard/books",
        label: "Books"
    },
    {
        path: "/dashboard/chapters",
        label: "Chapters"
    },
    {
        path: "/dashboard/topics",
        label: "Topics"
    },
    {
        path: "/dashboard/verses",
        label: "Verses"
    },
    {
        path: "/dashboard/commentaries",
        label: "Commentaries"
    },
    {
        path: "/dashboard/authors",
        label: "Authors"
    },
    {
        path: "/dashboard/notes",
        label: "Notes"
    },
    {
        path: "/dashboard/users",
        label: "Users"
    },
    {
        path: "/dashboard/blogs",
        label: "Blogs"
    },
    {
        path: "/dashboard/activities",
        label: "Activities"
    },
    {
        path: "/dashboard/archives",
        label: "Archives"
    },
    {
        path: "/dashboard/about",
        label: "About Page"
    },
    {
        path: "/dashboard/settings",
        label: "Settings"
    },
]
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    session: Session;

}

export default function DashboardSidebar({ session, className }: SidebarProps) {
    const pathname = usePathname()
    const { sidebarActive, setSidebarActive } = useSidebarStore()


    useEffect(() => {
        setSidebarActive(false)
    }, [pathname, setSidebarActive])

    return (
        <div className={cn(
            "py-5 shadow bg-white min-h-screen",
            sidebarActive ? "fixed z-50" : "hidden",
            "xl:!static",
            className
        )}>
            <ScrollArea className="h-full px-1 max-h-[calc(100vh_-_100px)] overflow-y-auto">

                <div className="space-y-1 p-2">
                    {
                        menuItems.map((menuItem) => (
                            canUserAccessPath(session.user, menuItem.path) &&
                            <Link href={menuItem.path}
                                key={menuItem.path}
                                className={cn(
                                    "w-full justify-start font-medium px-5 py-3 rounded-md  block",
                                    pathname === (menuItem.path) ? "bg-primary text-white" : "hover:bg-silver-light/60 hover:text-slate-900"
                                )}
                            >
                                {menuItem.label}
                            </Link>
                        ))
                    }
                </div>
            </ScrollArea>
        </div>
    )
}


export function ResponsiveSidebarButtton() {
    const { sidebarActive, setSidebarActive } = useSidebarStore()

    const handleButtonClick = () => {
        setSidebarActive(!sidebarActive)
    };
    return (
        <div>
            {
                sidebarActive ? (
                    <Button
                        className="bg-white hover:bg-primary hover:text-white  text-black rounded-lg xl:hidden"
                        onClick={handleButtonClick}
                    >
                        <Cross1Icon />
                    </Button>
                ) : (
                    <Button
                        className="bg-white hover:bg-primary hover:text-white  text-black rounded-lg xl:hidden"
                        onClick={handleButtonClick}
                    >
                        <TextAlignJustifyIcon />
                    </Button>
                )}
        </div>
    )
}