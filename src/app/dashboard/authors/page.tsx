"use client";

import { useState } from "react";
import AuthorsTable from "@/components/dashboard/tables/authors.table";
import AuthorsForm from "@/components/dashboard/forms/authors.form";
import { IAuthor } from "@/shared/types/models.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";

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
    <div>
      <Card className="min-h-[600px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="font-bold text-2xl">Authors</CardTitle>
            <Button type="button" onClick={openAdd}>
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <AuthorsTable
            editAction={(author: IAuthor) => (
              <span
                className="cursor-pointer"
                onClick={() => openEdit(author)}
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
        title={selectedAuthor ? "Update Author" : "Add New Author"}
      >
        <AuthorsForm
          key={selectedAuthor?.id ?? "new-author"}
          author={selectedAuthor}
          onReset={closePanel}
        />
      </FormSidePanel>
    </div>
  );
}
