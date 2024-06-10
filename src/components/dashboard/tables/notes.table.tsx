"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { PaginatedApiResponse } from "@/shared/types/api.types";
import { TablePagination, perPageCountOptions } from "./shared/pagination";
import { INote, IUser, IVerse } from "@/shared/types/models.types";
import Link from "next/link";
import { cn, extractTextFromHtml } from "@/lib/utils";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";

type Props = {
  user?: IUser;
  verse?: IVerse;
};

export default function NotesTable({ user, verse }: Props) {
  const [tableData, setTableData] = useState<PaginatedApiResponse<
    INote[]
  > | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(perPageCountOptions[0]);
  const searchQuery = useTableSearchStore((state) => state.searchQuery);

  const loadData = async () => {
    setTableData(null);
    const res = await clientApiHandlers.notes.get({
      page: currentPage,
      perPage: perPage,
      include: {
        user: true,
        verse: {
          include: {
            topic: {
              include: {
                chapter: {
                  include: { book: true },
                },
              },
            },
          },
        },
      },
      user: user?.id,
      verse: verse?.id,
      where: {
        OR: [
          { text: { contains: searchQuery } },
          { user: { name: { contains: searchQuery } } },
        ...(isNaN(parseInt(searchQuery)) ? [] : [{ verse: { number: { equals: parseInt(searchQuery) } } }]),
          { verse: { topic: { name: { contains: searchQuery } } } },
        ],
      },
    });
    setTableData(res);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage]);

  const pagination: TablePagination = {
    onPageChange: setCurrentPage,
    currentPage: currentPage,
    perPage: perPage,
    setPerPage: setPerPage,
    totalPages: tableData?.pagination?.totalPages ?? 1,
  };

  const tableColumns = columns({
    viewAction: (note: INote) => (
      <Link href={`/dashboard/notes/${note.id}`}>View</Link>
    ),
    editAction: (note: INote) => (
      <Link href={`/dashboard/notes/${note.id}/edit`}>Edit</Link>
    ),
    // archiveAction: true,
    // deleteAction: true,
    // restoreAction: archivedOnly,
    modelName: "Note",
  });

  return (
    <div>
      <BaseTable
        data={tableData?.data}
        pagination={pagination}
        columns={tableColumns}
      />
    </div>
  );
}

function columns(rowActions: TableActionProps): ColumnDef<INote, any>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    // {
    //     id: "index",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="#" />
    //     ),
    //     cell: ({ row }) => <div className="w-[30px]">{row.index + 1}</div>,
    //     enableSorting: false,
    //     enableHiding: false,
    // },
    {
      id: "text",
      accessorFn: (note) => extractTextFromHtml(note.text),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Text" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span className="max-w-[500px] line-clamp-1 font-medium">
              {extractTextFromHtml(row.original.text)}
            </span>
          </div>
        );
      },
    },
    {
      id: "user",
      accessorFn: (note) => note.user?.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => {
        const archived = row.original.user?.archived ?? true;
        return (
          <div className="flex items-center">
            <Link
              href={archived ? "#" : `/dashboard/users/${row.original.userId}`}
              className={cn(
                "max-w-[100px] truncate font-medium",
                archived ? "text-gray-700" : "text-primary"
              )}
            >
              {row.original.user?.name}
            </Link>
          </div>
        );
      },
    },
    {
      id: "verse",
      accessorFn: (note) => {
        const chapter = note.verse?.topic?.chapter;
        return `${chapter?.book?.abbreviation} ${chapter?.name}:${note.verse?.number}`;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Verse" />
      ),
      cell: ({ row }) => {
        const archived = row.original.verse?.archived ?? true;
        const chapter = row.original.verse?.topic?.chapter;
        return (
          <div className="flex items-center">
            <Link
              href={
                archived ? "#" : `/dashboard/verses/${row.original.verseId}`
              }
              className={cn(
                "max-w-[100px] truncate font-medium",
                archived ? "text-gray-700" : "text-primary"
              )}
            >
              {`${chapter?.book?.abbreviation} ${chapter?.name}:${row.original.verse?.number}`}
            </Link>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => <DataTableRowActions row={row} {...rowActions} />,
    },
  ];
}
