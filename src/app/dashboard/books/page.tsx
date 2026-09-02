"use client";

import BooksTable from "@/components/dashboard/tables/books.table";
import BooksForm from "@/components/dashboard/forms/books.form";
import { useState } from "react";
import { IBook } from "@/shared/types/models.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";

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
    <div>
      <Card className="min-h-[600px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="font-bold text-2xl">Books</CardTitle>
            <Button type="button" onClick={openAdd}>
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-5 md:p-5">
          <BooksTable
            editAction={(book) => (
              <span
                className="cursor-pointer"
                onClick={() => openEdit(book)}
              >
                Edit
              </span>
            )}
          />
        </CardContent>
      </Card>

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
    </div>
  );
}
