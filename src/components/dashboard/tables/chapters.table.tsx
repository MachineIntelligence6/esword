"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PaginatedApiResponse } from "@/shared/types/api.types";
import { TablePagination, perPageCountOptions } from "./shared/pagination";
import { IBook, IChapter } from "@/shared/types/models.types";
import { cn, extractTextFromHtml } from "@/lib/utils";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";

type Props = {
  book?: IBook;
  archivedOnly?: boolean;
};

export default function ChaptersTable({ book, archivedOnly }: Props) {
  const [tableData, setTableData] = useState<PaginatedApiResponse<
    IChapter[]
  > | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(perPageCountOptions[0]);
  const { searchQuery } = useTableSearchStore();

  const loadData = async () => {
    setTableData(null);
    const res = await clientApiHandlers.chapters.get({
      page: currentPage,
      perPage: perPage,
      include: { book: true },
      book: book?.id,
      where: {
        ...(searchQuery && {
          OR: [
            ...(isNaN(parseInt(searchQuery)) ? [] : [{ name: { equals: parseInt(searchQuery) } }]),
            { slug: { contains: searchQuery } },
            { commentaryName: { contains: searchQuery } },
            { commentaryText: { contains: searchQuery } },
            { book: { name: { contains: searchQuery } } },
          ],
        }),
        ...(archivedOnly && { archived: true }),
      },
    });
    setTableData(res);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage, searchQuery]);

  const pagination: TablePagination = {
    onPageChange: setCurrentPage,
    currentPage: currentPage,
    perPage: perPage,
    setPerPage: setPerPage,
    totalPages: tableData?.pagination?.totalPages ?? 1,
  };

  const tableActionProps: TableActionProps = {
    viewAction: (chapter) => (
      <Link href={`/dashboard/chapters/${chapter.id}`}>View</Link>
    ),
    editAction: (chapter) => (
      <Link href={`/dashboard/chapters/${chapter.id}/edit`}>Edit</Link>
    ),
    archiveAction: true,
    deleteAction: true,
    restoreAction: archivedOnly,
    modelName: "Chapter",
  };

  return (
    <div>
      <BaseTable
        data={tableData?.data}
        columns={columns(tableActionProps)}
        pagination={pagination}
        toolbarActions={tableActionProps}
      />
    </div>
  );
}

function columns(rowActions: TableActionProps): ColumnDef<IChapter, any>[] {
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
      id: "name",
      accessorFn: (chapter) => String(chapter.name),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex max-w-[100px] space-x-2">
            <span className="max-w-[100px] truncate font-medium">
              {row.original.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <Link
              href={`/dashboard/chapters/${row.original.id}`}
              className="max-w-[100px] text-primary truncate font-normal"
            >
              {row.getValue("slug")}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "commentaryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Commentary Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex max-w-[100px] space-x-2">
            <span className="max-w-[100px] truncate font-medium">
              {row.original.commentaryName}
            </span>
          </div>
        );
      },
    },
    {
      id: "commentaryText",
      accessorFn: (chapter) =>
        extractTextFromHtml(chapter.commentaryText ?? ""),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Commentary Text" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex max-w-[100px] space-x-2">
            <span className="max-w-[100px] truncate font-medium">
              {extractTextFromHtml(row.original.commentaryText ?? "")}
            </span>
          </div>
        );
      },
    },
    {
      id: "book",
      accessorFn: (chapter) => chapter.book?.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Book" />
      ),
      cell: ({ row }) => {
        const archived = row.original.book?.archived ?? true;
        return (
          <div className="flex items-center">
            <Link
              href={archived ? "#" : `/dashboard/books/${row.original.bookId}`}
              className={cn(
                "max-w-[100px] truncate font-medium",
                archived ? "text-gray-700" : "text-primary"
              )}
            >
              {row.original.book?.name}
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
