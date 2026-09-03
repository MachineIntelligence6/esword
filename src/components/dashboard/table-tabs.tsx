"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type TableTab = {
  key: string;
  label: string;
  count?: number;
};

export type TableTabsProps = {
  tabs: TableTab[];
  activeKey: string;
  onChange: (key: string) => void;
  ariaLabel: string;
  className?: string;
};

/**
 * Elisen TableTabs: tabs sit as the table card's header; active tab has an
 * accent underline on the dividing line (-mb-px).
 */
export function TableTabs({
  tabs,
  activeKey,
  onChange,
  ariaLabel,
  className,
}: TableTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeKey]);

  const focusTab = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    onChange(tabs[next].key);
    listRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusTab(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusTab(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusTab(tabs.length - 1);
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "scrollbar-none flex overflow-x-auto border-b border-slate-200",
        className
      )}
    >
      {tabs.map((tab, i) => {
        const selected = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`tab-${tab.key}`}
            aria-selected={selected}
            aria-controls={`tabpanel-${tab.key}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.key)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-slate-950",
              selected
                ? "border-primary font-semibold text-slate-950"
                : "border-transparent text-slate-600 hover:text-slate-950"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-xs px-1.5 py-0.5 text-xs font-medium",
                  selected
                    ? "bg-accent-subtle text-primary-dark"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
