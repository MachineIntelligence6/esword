'use client'
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BackButton, LogoutButton } from "@/components/dashboard/buttons"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDownIcon, TextAlignJustifyIcon, Cross1Icon, MagnifyingGlassIcon, PersonIcon, } from "@radix-ui/react-icons"
import { Session } from "next-auth";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { ResponsiveSidebarButtton } from "./dashboard/sidebar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";



type Props = {
    session: Session | null
}

export default function SiteHeader() {
    const { data: session } = useSession()
    const pathname = usePathname()
    // if (pathname.startsWith("/dashboard")) return null
    return (
        <header className="fixed left-0 top-0 z-50 shadow w-full max-w-[100vw] overflow-hidden">
            <nav className="flex justify-between px-3 md:px-6 items-center h-[70px] w-full bg-primary">
                <div>
                    <Link href="/">
                        <Image width={250} height={100} quality={100} alt="" src="/images/logo.png" className="object-contain bg-cover md:min-h-[60px] w-[150px] min-w-[150px] md:min-w-[200px] md:w-[250px]" />
                    </Link>
                </div>
                <div className="flex items-center gap-2 md:gap-x-6">
                    {
                        !pathname.startsWith("/dashboard") && !pathname.startsWith("/login") &&
                        <div className="flex text-white lg:gap-x-11 md:gap-x-6 md:px-3 px-5 gap-x-1 text-sm">
                            <div className="flex lg:hidden">
                                <Dropdown />
                            </div>
                            <div className="hidden lg:flex items-center md:gap-x-6 ">
                                {
                                    menuList.map((menuItem, index) => (
                                        <div
                                            key={index}
                                            className="font-normal py-3 text-white md:block hidden hover:scale-110 transition-all"
                                        >
                                            <a href={menuItem.path}>{menuItem.label}</a>
                                        </div>
                                    ))
                                }


                            </div>
                            <div className="lg:block hidden">
                                <SearchComponent />
                            </div>
                        </div>
                    }
                    {
                        pathname.startsWith("/dashboard") &&
                        <ResponsiveSidebarButtton />
                    }
                    <div className="flex text-white">

                        {session && <UserDropdownMenu session={session} />}
                    </div>
                </div>
            </nav>
        </header>
    );
}




const searchFormSchema = z.object({
    query: z.string()
})
type SearchFormSchema = z.infer<typeof searchFormSchema>

function SearchComponent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const form = useForm<SearchFormSchema>({
        mode: "all",
        resolver: zodResolver(searchFormSchema),
        defaultValues: {
            query: searchParams.get("q") ?? ""
        }
    })

    const handleFormSubmit = ({ query }: SearchFormSchema) => {
        router.push(`/search?q=${query}`)
    }

    return (
        <div className="flex gap-x-3  rounded-[42px] border lg:border-white b border-opacity-70 items-center">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                    <FormField
                        control={form.control}
                        name="query"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <div className="flex items-center gap-3 px-3">
                                    <MagnifyingGlassIcon className="w-5 h-5" />
                                    <input
                                        {...field}
                                        type="text"
                                        className="bg-transparent outline-none border-none py-2 autofill-text-white" />
                                </div>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    )
}

type MenuList = {
    path: string;
    label: string;
}
export const menuList: Array<MenuList> = [
    {
        path: "/",
        label: "Home"
    },
    {
        path: "/donate",
        label: "Donate"
    },
    {
        path: "/about",
        label: "About"
    },
    {
        path: "/manuscripts",
        label: "Manuscripts"
    },
    {
        path: "/problems",
        label: "Problems"
    },
    {
        path: "/search",
        label: "Search"
    },

]
function Dropdown() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger>
                <div className="flex gap-1 items-center">
                    {menuList.find((m) => m.path === pathname)?.label}
                    <ChevronDownIcon />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="lg:hidden ">
                {
                    menuList.map((menuItem, index) => (
                        menuItem.path !== "/search" &&
                        <Link key={index} href={menuItem.path} className="w-full block px-3 py-1">
                            {menuItem.label}
                        </Link>
                    ))
                }
                <DropdownMenuSeparator />
                <SearchComponent />
            </DropdownMenuContent>
        </DropdownMenu>

    )
}



export function UserDropdownMenu({ session }: { session: Session }) {
    const pathname = usePathname()
    const router = useRouter()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='outline' className="h-auto p-2 aspect-square rounded-full">
                    <PersonIcon className="w-6 h-6 text-primary-dark" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" className="w-56">
                <DropdownMenuLabel>
                    <span className="block">{session?.user.name}</span>
                    <span className="block text-sm font-normal">{session?.user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {
                    (session.user.role === "ADMIN" || session.user.role === "EDITOR") && (
                        <>
                            {
                                pathname.startsWith("/dashboard") ?
                                    <DropdownMenuItem onClick={() => router.push("/")}>Home</DropdownMenuItem>
                                    :
                                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
                            }
                            <DropdownMenuSeparator />
                        </>
                    )
                }
                <LogoutButton />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}



