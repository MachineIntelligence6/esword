"use client";

import { useState } from "react";
import NotesTable from "@/components/dashboard/tables/notes.table";
import NotesEditorForm from "@/components/dashboard/forms/notes.form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";
import { INote } from "@/shared/types/models.types";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<INote | null>(null);

  const openEdit = (note: INote) => {
    setSelectedNote(note);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedNote(null);
  };

  return (
    <div>
      <Card className="min-h-[600px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <CardTitle className="font-bold text-2xl">All Notes</CardTitle>
        </CardHeader>
        <CardContent className="px-3 py-5 md:p-5">
          <NotesTable
            user={session?.user?.role === "ADMIN" ? "" : session?.user}
            editAction={(note: INote) => (
              <span
                className="cursor-pointer"
                onClick={() => openEdit(note)}
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
        title="Update Note"
        className="sm:max-w-3xl"
      >
        {selectedNote ? (
          <NotesEditorForm key={selectedNote.id} note={selectedNote} />
        ) : null}
      </FormSidePanel>
    </div>
  );
}
