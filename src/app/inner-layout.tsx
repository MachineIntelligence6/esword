'use client'

import { ReactNode } from "react"
import SiteSidebar from "./sidebar"
import { usePathname } from "next/navigation"


export default function SiteInnerLayout({ children }: { children?: ReactNode }) {
    const pathname = usePathname();

    return (
        <>
            {
                pathname.startsWith("/dashboard") ?
                    children
                    :
                    <div className="">
                        <div className="flex lg:flex-row flex-col max-h-screen lg:overflow-hidden ">
                            <SiteSidebar />
                            {children}
                        </div>
                    </div>
            }
        </>
    )
}


