'use client'

import { ClipboardEvent, ReactNode } from "react"
import SiteSidebar from "./sidebar"
import { usePathname } from "next/navigation"


export default function SiteInnerLayout({ children }: { children?: ReactNode }) {
    const pathname = usePathname();

    const copyCutPasteHandler = (e: ClipboardEvent<HTMLDivElement>) => {
        if (pathname.startsWith("/dashboard")) return;
        e.preventDefault();
        e.stopPropagation();
    }

    return (
        <div className="w-full h-full" onPaste={copyCutPasteHandler} onCut={copyCutPasteHandler} onCopy={copyCutPasteHandler}>
            {
                pathname.startsWith("/dashboard") || pathname.startsWith("/login") ?
                    children
                    :
                    <div className="">
                        <div className="flex lg:flex-row flex-col max-h-screen lg:overflow-hidden ">
                            <SiteSidebar />
                            {children}
                        </div>
                    </div>
            }
        </div>
    )
}


