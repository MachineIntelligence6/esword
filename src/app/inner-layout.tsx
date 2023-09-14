'use client'
import React, { ClipboardEvent, ReactNode, useEffect, useState } from "react"
import SiteSidebar from "./sidebar"
import { usePathname } from "next/navigation"
import { Resizable } from "re-resizable";


export default function SiteInnerLayout({ children }: { children?: ReactNode }) {
    const pathname = usePathname();
    const [windowSize, setWindowSize] = useState<{ width: number; height: number }>();

    const copyCutPasteHandler = (e: ClipboardEvent<HTMLDivElement>) => {
        if (pathname.startsWith("/dashboard")) return;
        e.preventDefault();
        e.stopPropagation();
    }
    useEffect(() => {
        window.onresize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        })
    }, [])

    return (
        <div className="w-full h-full" onPaste={copyCutPasteHandler} onCut={copyCutPasteHandler} onCopy={copyCutPasteHandler}>
            {
                pathname.startsWith("/dashboard") || pathname.startsWith("/login") ?
                    children
                    :
                    <div className="">
                        <div className="flex lg:flex-row flex-col max-h-[calc(100vh_-_80px)] lg:max-h-[calc(100vh_-_70px)] overflow-y-auto lg:overflow-hidden">
                            {/* <SiteSidebar />
                            {children} */}
                            {
                                windowSize &&
                                (
                                    windowSize.width < 1024 ?
                                        <SiteSidebar />
                                        :
                                        <Resizable
                                            defaultSize={{ height: windowSize.height, width: 250 }}
                                            maxWidth={400}
                                            minWidth={230}
                                            bounds="parent"
                                            className="overflow-hidden"
                                            handleClasses={{ right: "bg-silver-light" }}>
                                            <SiteSidebar />
                                        </Resizable>
                                )
                            }
                            {children}
                        </div>
                    </div>
            }
        </div>
    )
}


