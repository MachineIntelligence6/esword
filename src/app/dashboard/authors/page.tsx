'use client'
import { useState } from "react";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link";
import AuthorsTable from "@/components/dashboard/tables/authors.table";
import AuthorsForm from "@/components/dashboard/forms/authors.form";
import { IAuthor } from "@/shared/types/models.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";




export default function Page() {
  const [selectedAuthor, setSelectedAuthor] = useState<IAuthor | null>(null);

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-8 w-full">
        <Card className="min-h-[600px]">
          <CardHeader className="border-b-8 border-silver-light py-4">
            <CardTitle className="font-bold text-2xl">
              Authors
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <AuthorsTable
              editAction={(author: IAuthor) => (
                <span onClick={() => setSelectedAuthor(author)}>
                  Edit
                </span>
              )} />

          </CardContent>
        </Card>
      </div>
      <div className="col-span-4">
        <AuthorsForm author={selectedAuthor} onReset={() => setSelectedAuthor(null)} />
      </div>
    </div>
  )
}