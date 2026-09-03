"use client";

import BooksTable from "@/components/dashboard/tables/books.table";
import BooksForm from "@/components/dashboard/forms/books.form";
import { useState } from "react";
import { IBook } from "@/shared/types/models.types";
import { Button } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";
import { ListPageShell } from "@/components/dashboard/list-page-shell";

export default function Page() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<IBook | null>(null);

  const openAdd = () => {
    setSelectedBook(null);
    setPanelOpen(true);
  };

  const openEdit = (book: IBook) => {
    setSelectedBook(book);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedBook(null);
  };

  return (
    <>
      <ListPageShell
        title="Books"
        addAction={
          <Button type="button" onClick={openAdd}>
            Add New
          </Button>
        }
      >
        <BooksTable
          hideSearch
          editAction={(book) => (
            <span className="cursor-pointer" onClick={() => openEdit(book)}>
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
        title={selectedBook ? "Update Book" : "Add New Book"}
      >
        <BooksForm
          key={selectedBook?.id ?? "new-book"}
          book={selectedBook}
          onReset={closePanel}
        />
      </FormSidePanel>
    </>
  );
}
