'use client'
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname } from 'next/navigation'
import Link from "next/link";
import { canUserAccessPath } from "@/lib/roles-manager";
import { useSession } from "next-auth/react";
import assert from "assert";
import Spinner from "@/components/spinner";
import { Session } from "next-auth";


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
        path: "/dashboard/settings",
        label: "Settings"
    },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    session: Session
}

export default function DashboardSidebar({ session, className }: SidebarProps) {
    const pathname = usePathname()
    return (
        <div className={cn("py-5 shadow bg-white min-h-full", className)}>
            <ScrollArea className="h-full px-1">
                <div className="space-y-1 p-2">
                    {
                        menuItems.map((menuItem) => (
                            canUserAccessPath(session.user, menuItem.path) &&
                            <Link href={menuItem.path}
                                key={menuItem.path}
                                className={cn(
                                    "w-full justify-start font-medium px-5 py-3 rounded-md block",
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