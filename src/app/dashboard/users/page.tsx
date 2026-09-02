"use client";

import { useState } from "react";
import UsersTable from "@/components/dashboard/tables/users.table";
import UsersForm from "@/components/dashboard/forms/users.form";
import { IUser } from "@/shared/types/models.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";

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
    <div>
      <Card className="min-h-[600px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="font-bold text-2xl">Users</CardTitle>
            <Button type="button" onClick={openAdd}>
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-5 md:p-5">
          <UsersTable
            editAction={(user: IUser) => (
              <span className="cursor-pointer" onClick={() => openEdit(user)}>
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
        title={selectedUser ? "Update User" : "Add New User"}
      >
        <UsersForm
          key={selectedUser?.id ?? "new-user"}
          user={selectedUser}
          onReset={closePanel}
        />
      </FormSidePanel>
    </div>
  );
}
