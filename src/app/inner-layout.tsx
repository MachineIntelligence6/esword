'use client'
import React, { ClipboardEvent, Component, ReactNode, useEffect, useState } from "react"
import SiteSidebar from "./sidebar"
import { usePathname } from "next/navigation"
import { Resizable } from "re-resizable";


export default function SiteInnerLayout({ children }: { children?: ReactNode }) {
    const pathname = usePathname();
    const [windowHeight, setWindowHeight] = useState(1100);

    const copyCutPasteHandler = (e: ClipboardEvent<HTMLDivElement>) => {
        if (pathname.startsWith("/dashboard")) return;
        e.preventDefault();
        e.stopPropagation();
    }
    useEffect(() => {
        setWindowHeight(window.innerHeight)
    }, [])

    return (
        <div className="w-full h-full" onPaste={copyCutPasteHandler} onCut={copyCutPasteHandler} onCopy={copyCutPasteHandler}>
            {
                pathname.startsWith("/dashboard") || pathname.startsWith("/login") ?
                    children
                    :
                    <div className="">
                        <div className="flex lg:flex-row flex-col max-h-screen lg:overflow-hidden">
                            {/* <SiteSidebar />
                            {children} */}
                            {
                                <Resizable
                                    defaultSize={{ height: windowHeight, width: 200 }}
                                    maxWidth={400}
                                    minWidth={180}
                                    bounds="parent"
                                    className="overflow-hidden"
                                    handleClasses={{ right: "bg-silver-light" }}>
                                    <SiteSidebar />
                                </Resizable>
                            }
                            {children}
                        </div>
                    </div>
            }
        </div>
    )
}


