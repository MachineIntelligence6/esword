"use client";

import { useState } from "react";
import UsersTable from "@/components/dashboard/tables/users.table";
import UsersForm from "@/components/dashboard/forms/users.form";
import { IUser } from "@/shared/types/models.types";
import { Button } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";
import { ListPageShell } from "@/components/dashboard/list-page-shell";

export default function Page() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const openAdd = () => {
    setSelectedUser(null);
    setPanelOpen(true);
  };

  const openEdit = (user: IUser) => {
    setSelectedUser(user);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <ListPageShell
        title="Users"
        addAction={
          <Button type="button" onClick={openAdd}>
            Add New
          </Button>
        }
      >
        <UsersTable
          hideSearch
          editAction={(user: IUser) => (
            <span className="cursor-pointer" onClick={() => openEdit(user)}>
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
        title={selectedUser ? "Update User" : "Add New User"}
      >
        <UsersForm
          key={selectedUser?.id ?? "new-user"}
          user={selectedUser}
          onReset={closePanel}
        />
      </FormSidePanel>
    </>
  );
}
