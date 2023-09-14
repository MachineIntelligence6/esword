'use client'
import { useState } from "react";
import UsersTable from "@/components/dashboard/tables/users.table";
import UsersForm from "@/components/dashboard/forms/users.form";
import { IUser } from "@/shared/types/models.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";




export default function Page() {
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);


  return (
    <div className="md:grid grid-cols-12 flex flex-col gap-5">
      <div className="col-span-8 w-full">
        <Card className="min-h-[600px]">
          <CardHeader className="border-b-8 border-silver-light py-4">
            <CardTitle className="font-bold text-2xl">
              Users
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-5 md:p-5">
            <UsersTable
              editAction={(user: IUser) => (
                <span onClick={() => setSelectedUser(user)}>Edit</span>
              )} />
          </CardContent>
        </Card>
      </div>
      <div className="col-span-4">
        <UsersForm user={selectedUser} onReset={() => setSelectedUser(null)} />
      </div>
    </div>
  )
}