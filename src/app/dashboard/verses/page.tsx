"use client";

import Link from "next/link";
import VersesTable from "@/components/dashboard/tables/verses.table";
import { buttonVariants } from "@/components/ui/button";
import { useParentListFilters } from "@/components/dashboard/tables/shared/parent-filters";
import { ListPageShell } from "@/components/dashboard/list-page-shell";

export default function Page() {
  const { bookIds, chapterIds } = useParentListFilters();

  return (
    <ListPageShell
      title="Verses"
      showParentFilters
      showChapterFilter
      addAction={
        <Link
          href="/dashboard/verses/add"
          className={buttonVariants({ variant: "default" })}
        >
          Add New
        </Link>
      }
    >
      <VersesTable bookIds={bookIds} chapterIds={chapterIds} hideSearch />
    </ListPageShell>
  );
}
