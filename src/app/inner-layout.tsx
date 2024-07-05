"use client"

import React, { ClipboardEvent, ReactNode } from "react";
import SiteSidebar from "./sidebar";
import { usePathname } from "next/navigation";
import { Resizable } from "re-resizable";
import useWindowSize from "@/components/hooks/use-window-size";

interface SiteInnerLayoutProps {
  children?: ReactNode;
}

const SiteInnerLayout: React.FC<SiteInnerLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const windowSize = useWindowSize();

  const copyCutPasteHandler = (e: ClipboardEvent<HTMLDivElement>) => {
    if (pathname.startsWith("/dashboard")) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const renderSidebar = () => {
    if (!windowSize) return null;

    return windowSize.width < 1024 ? (
      <SiteSidebar />
    ) : (
      <Resizable
        defaultSize={{ height: windowSize.height, width: 250 }}
        maxWidth={400}
        minWidth={230}
        bounds="parent"
        className="overflow-hidden"
        handleClasses={{ right: "bg-silver-light" }}
      >
        <SiteSidebar />
      </Resizable>
    );
  };

  return (
    <div
      className="w-full h-full"
      onPaste={copyCutPasteHandler}
      onCut={copyCutPasteHandler}
      onCopy={copyCutPasteHandler}
    >
      {pathname.startsWith("/dashboard") || pathname.startsWith("/login") ? (
        children
      ) : (
        <div className="flex lg:flex-row flex-col max-h-[calc(100vh_-_100px)] lg:max-h-[calc(100vh_-_70px)] overflow-y-auto lg:overflow-hidden"
          style={{ maxHeight: windowSize ? `${windowSize.height - 70}px` : '100vh' }}
        >
          {renderSidebar()}
          {children}
        </div>
      )}
    </div>
  );
};


export default SiteInnerLayout;