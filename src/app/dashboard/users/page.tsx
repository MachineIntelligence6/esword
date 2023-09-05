'use client'
import { useState } from "react";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link";
import UsersTable from "@/components/dashboard/tables/users.table";
import UsersForm from "@/components/dashboard/forms/users.form";
import { IUser } from "@/shared/types/models.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";




export default function Page() {
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const { toast } = useToast();


  return (
    <div className="grid grid-cols-12 gap-5">
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