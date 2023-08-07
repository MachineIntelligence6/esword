import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator";
import { usePathname } from 'next/navigation'
import Link from "next/link";


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

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export default function DashboardSidebar({ className }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className={cn("py-12 border-r min-h-screen border-slate-200", className)}>
            <ScrollArea className="h-full px-1">
                <div className="space-y-1 p-2">
                    {
                        menuItems.map((menuItem, index) => (
                            <Link
                                href={menuItem.path}
                                key={menuItem.path}
                                className={cn(
                                    "w-full justify-start font-medium px-5 py-3 rounded-md block",
                                    pathname === (menuItem.path) ? "bg-slate-200 text-slate-900" : "hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                {menuItem.label}
                            </Link>
                        ))}
                </div>
            </ScrollArea>
        </div>
    )
}