'use client'
import BooksTable from "@/components/dashboard/tables/books.table";
import BooksForm from "@/components/dashboard/forms/books.form";
import { useState } from "react";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link";
import { IBook } from "@/shared/types/models.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



export default function Page() {
  const [selectedBook, setSelectedBook] = useState<IBook | null>(null);
  const { toast } = useToast();


  return (
    <div className="xl:grid grid-cols-12 gap-5">
      <div className="col-span-8 w-full">
        <Card className="min-h-[600px]">
          <CardHeader className="border-b-8 border-silver-light py-4">
            <CardTitle className="font-bold text-2xl">
              Books
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-5 md:p-5">
            <BooksTable
              editAction={(book) => (
                <span onClick={() => setSelectedBook(book)}>
                  Edit
                </span>
              )} />

          </CardContent>
        </Card>
      </div>
      <div className="col-span-4">
        <BooksForm book={selectedBook} onReset={() => setSelectedBook(null)} />
      </div>
    </div>
  )
}