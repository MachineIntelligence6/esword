"use client";

import { useState } from "react";
import NotesTable from "@/components/dashboard/tables/notes.table";
import NotesEditorForm from "@/components/dashboard/forms/notes.form";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";
import { INote } from "@/shared/types/models.types";
import { useSession } from "next-auth/react";
import { ListPageShell } from "@/components/dashboard/list-page-shell";

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
    <>
      <ListPageShell title="Notes">
        <NotesTable
          hideSearch
          user={session?.user?.role === "ADMIN" ? "" : session?.user}
          editAction={(note: INote) => (
            <span className="cursor-pointer" onClick={() => openEdit(note)}>
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
        title="Update Note"
        className="sm:max-w-3xl"
      >
        {selectedNote ? (
          <NotesEditorForm key={selectedNote.id} note={selectedNote} />
        ) : null}
      </FormSidePanel>
    </>
  );
}
