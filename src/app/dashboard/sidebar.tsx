'use client'
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname, useRouter } from 'next/navigation'
import Link from "next/link";
import Image from "next/image";
import { canUserAccessPath } from "@/lib/roles-manager";
import { Session } from "next-auth";
import { Cross1Icon, ExitIcon, HomeIcon, PersonIcon, TextAlignJustifyIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useSidebarStore } from "@/lib/zustand/sidebarStore";
import { signOut } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    Library,
    Megaphone,
    NotebookPen,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    UsersRound,
} from "lucide-react";


type MenuItem = {
    path: string;
    label: string;
}

type NavChild = {
    path: string;
    label: string;
}

type NavGroup = {
    id: string;
    label: string;
    icon: ReactNode;
    path?: string;
    children?: NavChild[];
}

export const navGroups: NavGroup[] = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/dashboard",
    },
    {
        id: "library",
        label: "Library",
        icon: <Library size={18} />,
        children: [
            { path: "/dashboard/books", label: "Books" },
            { path: "/dashboard/chapters", label: "Chapters" },
            { path: "/dashboard/topics", label: "Topics" },
            { path: "/dashboard/verses", label: "Verses" },
        ],
    },
    {
        id: "study",
        label: "Study",
        icon: <NotebookPen size={18} />,
        children: [
            { path: "/dashboard/commentaries", label: "Commentaries" },
            { path: "/dashboard/authors", label: "Authors" },
            { path: "/dashboard/notes", label: "Notes" },
        ],
    },
    {
        id: "publishing",
        label: "Publishing",
        icon: <Megaphone size={18} />,
        children: [
            { path: "/dashboard/blogs", label: "Blogs" },
            { path: "/dashboard/about", label: "About Page" },
        ],
    },
    {
        id: "admin",
        label: "Admin",
        icon: <UsersRound size={18} />,
        children: [
            { path: "/dashboard/users", label: "Users" },
            { path: "/dashboard/activities", label: "Activities" },
            { path: "/dashboard/archives", label: "Archives" },
        ],
    },
    {
        id: "settings",
        label: "Settings",
        icon: <Settings size={18} />,
        path: "/dashboard/settings",
    },
]

export const menuItems: Array<MenuItem> = navGroups.flatMap((group) => {
    if (group.path) return [{ path: group.path, label: group.label }]
    return group.children ?? []
})

function isActivePath(pathname: string, path: string) {
    if (path === "/dashboard") return pathname === "/dashboard"
    return pathname === path || pathname.startsWith(`${path}/`)
}

function groupContainsPath(group: NavGroup, pathname: string) {
    if (group.path) return isActivePath(pathname, group.path)
    return (group.children ?? []).some((child) => isActivePath(pathname, child.path))
}

function ProfileMenu({
    session,
    collapsed,
    onHome,
    onSettings,
    onLogout,
}: {
    session: Session;
    collapsed: boolean;
    onHome: () => void;
    onSettings: () => void;
    onLogout: () => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex items-center rounded-sm text-left hover:bg-white/15",
                        collapsed
                            ? "h-10 w-10 justify-center"
                            : "w-full gap-3 px-3 py-2.5"
                    )}
                    aria-label="Account menu"
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                        <PersonIcon className="h-4 w-4" />
                    </span>
                    {!collapsed && (
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-white">
                                {session.user.name}
                            </span>
                            <span className="block truncate text-xs text-white/75">
                                {session.user.email}
                            </span>
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>
                    <span className="block">{session.user.name}</span>
                    <span className="block text-sm font-normal text-slate-500">
                        {session.user.email}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onHome}>
                    <HomeIcon className="mr-2 h-4 w-4" />
                    Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSettings}>
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                    <ExitIcon className="mr-2 h-4 w-4" />
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    session: Session;
    variant?: "desktop" | "mobile";
}

export default function DashboardSidebar({ session, className, variant = "desktop" }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const {
        sidebarActive,
        setSidebarActive,
        desktopCollapsed,
        toggleDesktopCollapsed,
    } = useSidebarStore()

    const collapsed = variant === "desktop" && desktopCollapsed

    const activeGroupId = useMemo(
        () => navGroups.find((group) => groupContainsPath(group, pathname))?.id ?? "dashboard",
        [pathname]
    )

    const [expanded, setExpanded] = useState(activeGroupId)

    useEffect(() => {
        setExpanded(activeGroupId)
    }, [activeGroupId])

    useEffect(() => {
        setSidebarActive(false)
    }, [pathname, setSidebarActive])

    const handleLogout = () => {
        signOut({ redirect: false }).then(() => {
            router.push('/login');
        })
    }

    const visibleGroups = navGroups
        .map((group) => {
            if (group.path) {
                return canUserAccessPath(session.user, group.path) ? group : null
            }
            const children = (group.children ?? []).filter((child) =>
                canUserAccessPath(session.user, child.path)
            )
            if (children.length === 0) return null
            return { ...group, children }
        })
        .filter(Boolean) as NavGroup[]

    return (
        <TooltipProvider delayDuration={200}>
        {variant === "mobile" && sidebarActive && (
            <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-40 bg-black/30 xl:hidden"
                onClick={() => setSidebarActive(false)}
            />
        )}
        <div className={cn(
            "flex flex-col bg-primary border-r border-primary-dark/10 transition-[width] duration-200 ease-out",
            variant === "desktop" && (collapsed ? "w-[64px]" : "w-[260px]"),
            variant === "mobile" && (sidebarActive ? "fixed inset-y-0 left-0 z-50 w-[280px]" : "hidden"),
            className
        )}>
            <div
                className={cn(
                    "flex shrink-0 items-center gap-2 border-b border-white/15",
                    collapsed ? "justify-center px-2 py-3" : "px-4 py-4"
                )}
            >
                {!collapsed && (
                    <Link href="/" className="min-w-0 flex-1">
                        <Image
                            src="/images/logo.svg"
                            alt="Hidden Sword"
                            width={200}
                            height={48}
                            priority
                            className="h-8 w-auto object-contain object-left"
                        />
                    </Link>
                )}
                {variant === "desktop" && (
                    <button
                        type="button"
                        onClick={toggleDesktopCollapsed}
                        aria-label={collapsed ? "Expand menu" : "Collapse menu"}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                )}
            </div>

            <ScrollArea className={cn("min-h-0 flex-1", collapsed ? "px-1.5" : "px-3")}>
                <nav aria-label="Main" className="py-1">
                    <ul className={cn("grid", collapsed ? "gap-1" : "gap-0.5")}>
                        {visibleGroups.map((group) => {
                            const hasChildren = !!group.children?.length
                            const isExpanded = expanded === group.id
                            const groupActive = groupContainsPath(group, pathname)
                            const itemClass = cn(
                                "flex w-full items-center rounded-sm text-sm transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white",
                                collapsed
                                    ? "h-10 w-10 justify-center px-0"
                                    : "h-10 gap-2 px-3",
                                groupActive && !hasChildren
                                    ? "bg-white/20 font-semibold text-white"
                                    : groupActive
                                        ? "bg-white/15 font-semibold text-white"
                                        : "font-medium text-white/90 hover:bg-white/15 hover:text-white"
                            )

                            if (collapsed) {
                                if (hasChildren) {
                                    return (
                                        <li key={group.id} className="flex justify-center">
                                            <DropdownMenu>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                type="button"
                                                                aria-label={group.label}
                                                                className={itemClass}
                                                            >
                                                                <span aria-hidden>{group.icon}</span>
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                        {group.label}
                                                    </TooltipContent>
                                                </Tooltip>
                                                <DropdownMenuContent side="right" align="start" className="w-48">
                                                    <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {group.children!.map((child) => (
                                                        <DropdownMenuItem
                                                            key={child.path}
                                                            onClick={() => router.push(child.path)}
                                                            className={cn(
                                                                isActivePath(pathname, child.path) &&
                                                                    "font-semibold"
                                                            )}
                                                        >
                                                            {child.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </li>
                                    )
                                }

                                return (
                                    <li key={group.id} className="flex justify-center">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link
                                                    href={group.path!}
                                                    aria-label={group.label}
                                                    aria-current={groupActive ? "page" : undefined}
                                                    className={itemClass}
                                                >
                                                    <span aria-hidden>{group.icon}</span>
                                                </Link>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                {group.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    </li>
                                )
                            }

                            return (
                                <li key={group.id}>
                                    {hasChildren ? (
                                        <button
                                            type="button"
                                            aria-expanded={isExpanded}
                                            onClick={() =>
                                                setExpanded((prev) => (prev === group.id ? "" : group.id))
                                            }
                                            className={itemClass}
                                        >
                                            <span aria-hidden className="shrink-0 opacity-90">
                                                {group.icon}
                                            </span>
                                            <span className="flex-1 text-left">{group.label}</span>
                                            <span aria-hidden className="text-white/70">
                                                {isExpanded ? (
                                                    <ChevronDown size={16} />
                                                ) : (
                                                    <ChevronRight size={16} />
                                                )}
                                            </span>
                                        </button>
                                    ) : (
                                        <Link
                                            href={group.path!}
                                            aria-current={groupActive ? "page" : undefined}
                                            className={itemClass}
                                        >
                                            <span aria-hidden className="shrink-0 opacity-90">
                                                {group.icon}
                                            </span>
                                            <span className="flex-1">{group.label}</span>
                                        </Link>
                                    )}

                                    {isExpanded && hasChildren && (
                                        <ul className="relative grid gap-0.5 py-0.5">
                                            <span
                                                aria-hidden
                                                className="absolute bottom-0 top-0 w-px bg-white/25"
                                                style={{ left: 21 }}
                                            />
                                            {group.children!.map((child) => {
                                                const childActive = isActivePath(pathname, child.path)
                                                return (
                                                    <li key={child.path}>
                                                        <Link
                                                            href={child.path}
                                                            aria-current={childActive ? "page" : undefined}
                                                            className={cn(
                                                                "flex h-10 items-center rounded-sm pl-10 pr-3 text-sm transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white",
                                                                childActive
                                                                    ? "font-semibold text-white"
                                                                    : "text-white/80 hover:text-white"
                                                            )}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </ScrollArea>

            <div
                className={cn(
                    "mt-auto border-t border-white/20",
                    collapsed ? "flex justify-center p-2" : "p-3"
                )}
            >
                <ProfileMenu
                    session={session}
                    collapsed={collapsed}
                    onHome={() => router.push("/")}
                    onSettings={() => router.push("/dashboard/settings")}
                    onLogout={handleLogout}
                />
            </div>
        </div>
        </TooltipProvider>
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
                        variant="outline"
                        size="icon"
                        className="xl:hidden"
                        onClick={handleButtonClick}
                    >
                        <Cross1Icon />
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="icon"
                        className="xl:hidden"
                        onClick={handleButtonClick}
                    >
                        <TextAlignJustifyIcon />
                    </Button>
                )}
        </div>
    )
}
