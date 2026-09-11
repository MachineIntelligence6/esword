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

  const isAuthPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/forgotpassowrd");

  const copyCutPasteHandler = (e: ClipboardEvent<HTMLDivElement>) => {
    if (isAuthPage) return;

    const target = e.target as HTMLElement | null;
    if (target?.closest("input, textarea, [contenteditable='true']")) return;

    e.preventDefault();
    e.stopPropagation();
  };

  const renderSidebar = () => {
    // Always render books/chapters; don't wait on window measurement or the
    // sidebar disappears and these pages look like a full-bleed login screen.
    if (windowSize && windowSize.width < 1024) {
      return <SiteSidebar />;
    }

    return (
      <Resizable
        defaultSize={{
          height: windowSize?.height ?? 800,
          width: 250,
        }}
        maxWidth={400}
        minWidth={230}
        bounds="parent"
        className="hidden overflow-hidden lg:block"
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
      {isAuthPage ? (
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