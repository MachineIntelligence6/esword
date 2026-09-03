"use client";

import { useState } from "react";
import Link from "next/link";
import CommentariesTable from "@/components/dashboard/tables/commentaries.table";
import CommentariesForm from "@/components/dashboard/forms/commentaries.form";
import { buttonVariants } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";
import { ICommentary } from "@/shared/types/models.types";
import { useParentListFilters } from "@/components/dashboard/tables/shared/parent-filters";
import { ListPageShell } from "@/components/dashboard/list-page-shell";

export default function Page() {
  const { bookIds, chapterIds } = useParentListFilters();
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedCommentary, setSelectedCommentary] =
    useState<ICommentary | null>(null);

  const openEdit = (commentary: ICommentary) => {
    setSelectedCommentary(commentary);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedCommentary(null);
  };

  return (
    <>
      <ListPageShell
        title="Commentaries"
        showParentFilters
        showChapterFilter
        addAction={
          <Link
            href="/dashboard/commentaries/add"
            className={buttonVariants({ variant: "default" })}
          >
            Add New
          </Link>
        }
      >
        <CommentariesTable
          bookIds={bookIds}
          chapterIds={chapterIds}
          hideSearch
          editAction={(commentary: ICommentary) => (
            <span
              className="cursor-pointer"
              onClick={() => openEdit(commentary)}
            >
              Edit
            </span>
          )}
        />
      </ListPageShell>

      <FormSidePanel
        open={panelOpen}
        onOpenChange={(open) => {
          if (!open) closePanel();
          else setPanelOpen(true);
        }}
        title="Update Commentary"
        className="sm:max-w-2xl"
      >
        {selectedCommentary ? (
          <CommentariesForm
            key={selectedCommentary.id}
            commentary={selectedCommentary}
          />
        ) : null}
      </FormSidePanel>
    </>
  );
}
