'use client'
import BooksTable from "@/components/dashboard/tables/books.table";
import BooksForm from "@/components/dashboard/forms/books.form";
import { useState } from "react";
import { IBook } from "@/shared/types/models.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



export default function Page() {
  const [selectedBook, setSelectedBook] = useState<IBook | null>(null);


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