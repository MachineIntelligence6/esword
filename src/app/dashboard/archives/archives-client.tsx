"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AuthorsTable from "@/components/dashboard/tables/authors.table";
import BlogsTable from "@/components/dashboard/tables/blogs.table";
import BooksTable from "@/components/dashboard/tables/books.table";
import ChaptersTable from "@/components/dashboard/tables/chapters.table";
import CommentariesTable from "@/components/dashboard/tables/commentaries.table";
import TopicsTable from "@/components/dashboard/tables/topics.table";
import UsersTable from "@/components/dashboard/tables/users.table";
import VersesTable from "@/components/dashboard/tables/verses.table";
import { ListPageShell } from "@/components/dashboard/list-page-shell";
import { TableTabs } from "@/components/dashboard/table-tabs";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";

const ARCHIVE_TABS = [
  { key: "books", label: "Books" },
  { key: "chapters", label: "Chapters" },
  { key: "topics", label: "Topics" },
  { key: "verses", label: "Verses" },
  { key: "commentaries", label: "Commentaries" },
  { key: "authors", label: "Authors" },
  { key: "users", label: "Users" },
  { key: "blogs", label: "Blogs" },
] as const;

type ArchiveTabKey = (typeof ARCHIVE_TABS)[number]["key"];

function isArchiveTabKey(value: string | null): value is ArchiveTabKey {
  return ARCHIVE_TABS.some((tab) => tab.key === value);
}

export default function ArchivesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setSearchQuery, setEntity } = useTableSearchStore();

  const activeKey: ArchiveTabKey = isArchiveTabKey(searchParams.get("tab"))
    ? (searchParams.get("tab") as ArchiveTabKey)
    : "books";

  useEffect(() => {
    setEntity(`archives:${activeKey}`);
    setSearchQuery("");
  }, [activeKey, setEntity, setSearchQuery]);

  const setTab = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const panel = useMemo(() => {
    switch (activeKey) {
      case "books":
        return <BooksTable archivedOnly hideSearch />;
      case "chapters":
        return <ChaptersTable archivedOnly hideSearch />;
      case "topics":
        return <TopicsTable archivedOnly hideSearch />;
      case "verses":
        return <VersesTable archivedOnly hideSearch />;
      case "commentaries":
        return <CommentariesTable archivedOnly hideSearch />;
      case "authors":
        return <AuthorsTable archivedOnly hideSearch />;
      case "users":
        return <UsersTable archivedOnly hideSearch />;
      case "blogs":
        return <BlogsTable archivedOnly hideSearch />;
      default:
        return null;
    }
  }, [activeKey]);

  return (
    <ListPageShell title="Archives" showSearch>
      <div className="overflow-hidden rounded-sm border border-slate-200 bg-white">
        <TableTabs
          tabs={[...ARCHIVE_TABS]}
          activeKey={activeKey}
          onChange={setTab}
          ariaLabel="Archive categories"
        />
        <div
          role="tabpanel"
          id={`tabpanel-${activeKey}`}
          aria-labelledby={`tab-${activeKey}`}
          className="p-0"
        >
          {panel}
        </div>
      </div>
    </ListPageShell>
  );
}
