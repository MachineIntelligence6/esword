'use client'
import { User } from "@prisma/client";
import { useState } from "react";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/dashboard/ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link";
import UsersTable from "@/components/dashboard/tables/users.table";
import UsersForm from "@/components/dashboard/forms/users.form";




export default function Page() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleDelete = async (user: User) => {
    const res = await clientApiHandlers.users.archive(user.id)
    if (res.succeed) {
      window.location.reload();
    } else {
      toast({
        title: "Error",
        variant: "destructive",
        description: definedMessages.UNKNOWN_ERROR
      })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-2xl">
          Users
        </h1>
      </div>
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-8 w-full">
          {
            <UsersTable
              viewAction={(user: User) => (
                <Link href={`/dashboard/users/${user.id}`}>View</Link>
              )}
              editAction={(user: User) => (
                <span onClick={() => setSelectedUser(user)}>Edit</span>
              )}
              deleteAction={handleDelete} />
          }
        </div>
        <div className="col-span-4 mt-12">
          <UsersForm user={selectedUser} onReset={() => setSelectedUser(null)} />
        </div>
      </div>
    </div>
  )
}