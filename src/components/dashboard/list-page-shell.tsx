"use client";

import { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";
import {
  ParentFilterControls,
  ParentFilterTags,
  ParentFiltersProvider,
} from "@/components/dashboard/tables/shared/parent-filters";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  addAction?: ReactNode;
  showParentFilters?: boolean;
  showChapterFilter?: boolean;
  showSearch?: boolean;
  children: ReactNode;
  className?: string;
};

function ToolbarEnd({
  showSearch,
  showParentFilters,
  addAction,
}: {
  showSearch: boolean;
  showParentFilters: boolean;
  addAction?: ReactNode;
}) {
  const { searchQuery, setSearchQuery } = useTableSearchStore();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {showSearch && (
        <Input
          size="sm"
          placeholder="Search..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          leadingIcon={<Search size={16} />}
          className="w-full min-w-[12rem] max-w-md sm:w-56"
          aria-label="Search"
        />
      )}
      {showParentFilters && <ParentFilterControls />}
      {addAction}
    </div>
  );
}

export function ListPageShell({
  title,
  addAction,
  showParentFilters = false,
  showChapterFilter = false,
  showSearch = true,
  children,
  className,
}: Props) {
  const content = (
    <div className={cn("min-h-full space-y-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold leading-8 text-slate-950">
          {title}
        </h1>
        <ToolbarEnd
          showSearch={showSearch}
          showParentFilters={showParentFilters}
          addAction={addAction}
        />
      </div>
      {showParentFilters && <ParentFilterTags />}
      {children}
    </div>
  );

  if (!showParentFilters) return content;

  return (
    <ParentFiltersProvider showChapter={showChapterFilter}>
      {content}
    </ParentFiltersProvider>
  );
}
