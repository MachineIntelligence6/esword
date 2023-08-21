'use client'
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";



export default function SiteHeader() {
    const pathname = usePathname()
    if (pathname.startsWith("/dashboard")) return null
    return (
        <header >
            <nav className="flex justify-between lg:px-0  items-center h-[60px] fixed top-0 left-0 w-full z-50 bg-primary">
                <div className="lg:px-1">
                    <Link href="/">
                        <Image width={250} height={100} alt="" src="/images/logo.png" className="object-contain bg-cover h-auto w-[250px]" />
                    </Link>
                </div>
                <div>
                    <div className="flex text-white lg:gap-x-11 md:gap-x-6 md:px-3 px-5 gap-x-1 text-sm">
                        <div className="flex lg:gap-x-0">
                            {/* use of dropdown function */}
                            <Dropdown />
                        </div>
                        <div>
                            <div className="font-normal py-3 lg:block hidden">
                                <Link href="/donate">Donate</Link>
                            </div>
                        </div>
                        <button className="flex gap-x-3 lg:border rounded-[42px] border-white border-opacity-70 items-center">
                            <i className="fa-solid fa-magnifying-glass pl-3"></i>
                            <p className="pr-[140px] font-normal lg:block hidden">
                                Search
                            </p>
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
}





import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDownIcon } from "@radix-ui/react-icons";

function Dropdown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="font-bold flex gap-1  items-center py-3">
                    <Link href="/">Home</Link>
                    <ChevronDownIcon className="h-4 w-4 shrink-0 text-white transition-transform lg:hidden"/>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="lg:hidden ">
                <DropdownMenuItem>
                    <a href="/" className="text-black hover:bg-primary/30 hover:text-primary-dark hover:font-bold">
                        Home
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <a href="/donate" className="text-black">
                        Donation
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    )
}