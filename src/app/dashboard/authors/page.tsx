"use client";

import { useState } from "react";
import AuthorsTable from "@/components/dashboard/tables/authors.table";
import AuthorsForm from "@/components/dashboard/forms/authors.form";
import { IAuthor } from "@/shared/types/models.types";
import { Button } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";
import { ListPageShell } from "@/components/dashboard/list-page-shell";

export default function Page() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<IAuthor | null>(null);

  const openAdd = () => {
    setSelectedAuthor(null);
    setPanelOpen(true);
  };

  const openEdit = (author: IAuthor) => {
    setSelectedAuthor(author);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedAuthor(null);
  };

  return (
    <>
      <ListPageShell
        title="Authors"
        addAction={
          <Button type="button" onClick={openAdd}>
            Add New
          </Button>
        }
      >
        <AuthorsTable
          hideSearch
          editAction={(author: IAuthor) => (
            <span className="cursor-pointer" onClick={() => openEdit(author)}>
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
        title={selectedAuthor ? "Update Author" : "Add New Author"}
      >
        <AuthorsForm
          key={selectedAuthor?.id ?? "new-author"}
          author={selectedAuthor}
          onReset={closePanel}
        />
      </FormSidePanel>
    </>
  );
}
