"use client";

import BooksTable from "@/components/dashboard/tables/books.table";
import BooksForm from "@/components/dashboard/forms/books.form";
import { useState } from "react";
import { IBook } from "@/shared/types/models.types";
import { Button } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";
import { BookReorderDialog } from "@/components/dashboard/book-reorder-dialog";
import { ListPageShell } from "@/components/dashboard/list-page-shell";

export default function Page() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [tableKey, setTableKey] = useState(0);
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
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setReorderOpen(true)}>
              Reorder
            </Button>
            <Button type="button" onClick={openAdd}>
              Add New
            </Button>
          </div>
        }
      >
        <BooksTable
          key={tableKey}
          hideSearch
          editAction={(book) => (
            <span className="cursor-pointer" onClick={() => openEdit(book)}>
              Edit
            </span>
          )}
        />
      </ListPageShell>

      <BookReorderDialog
        open={reorderOpen}
        onOpenChange={setReorderOpen}
        onSaved={() => setTableKey((k) => k + 1)}
      />

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
