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
                            <div className="font-bold py-3 lg:block hidden">
                                <Link href="/">Home</Link>
                            </div>
                            <select name="" id="" className="bg-transparent lg:hidden md:w-auto w-16">
                                <option value="Home" className="text-black">Home</option>
                                <option value="Home" className="text-black">Donation</option>
                            </select>
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



