"use client";

import Link from "next/link";
import ChaptersTable from "@/components/dashboard/tables/chapters.table";
import { buttonVariants } from "@/components/ui/button";
import { useParentListFilters } from "@/components/dashboard/tables/shared/parent-filters";
import { ListPageShell } from "@/components/dashboard/list-page-shell";

export default function Page() {
  const { bookIds } = useParentListFilters();

  return (
    <ListPageShell
      title="Chapters"
      showParentFilters
      addAction={
        <Link
          href="/dashboard/chapters/add"
          className={buttonVariants({ variant: "default" })}
        >
          Add New
        </Link>
      }
    >
      <ChaptersTable bookIds={bookIds} hideSearch />
    </ListPageShell>
  );
}
