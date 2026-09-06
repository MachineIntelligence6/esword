"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import { useCallback } from "react";
import clientApiHandlers from "@/client/handlers";
import { IBook } from "@/shared/types/models.types";
import Link from "next/link";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";
import { TableCellLink, TableCellText } from "./shared/table-cell";
import { formatTableDate } from "./shared/format";
import { useInfiniteList } from "./shared/use-infinite-list";
import { BOOK_EXPORT_FORMATS, BookExportFormat } from "@/lib/book-export";
import { toast } from "@/components/ui/use-toast";
import definedMessages from "@/shared/constants/messages";

type Props = Omit<TableActionProps, "modelName"> & {
  showToolbar?: boolean;
  archivedOnly?: boolean;
  hideSearch?: boolean;
};

export default function BooksTable({
  showToolbar,
  archivedOnly,
  hideSearch = false,
  ...props
}: Props) {
  const { searchQuery } = useTableSearchStore();

  const fetcher = useCallback(
    (page: number, pageSize: number) =>
      clientApiHandlers.books.get({
        page,
        perPage: pageSize,
        include: { _count: { select: { chapters: true } } },
        where: {
          ...(searchQuery && {
            OR: [
              { name: { contains: searchQuery } },
              { slug: { contains: searchQuery } },
              { abbreviation: { contains: searchQuery } },
              ...(isNaN(parseInt(searchQuery))
                ? []
                : [{ priority: { equals: parseInt(searchQuery) } }]),
            ],
          }),
          ...(archivedOnly && { archived: true }),
        },
      }),
    [searchQuery, archivedOnly]
  );

  const { data, hasMore, loadMore, loadingMore } = useInfiniteList<IBook>({
    fetcher,
    deps: [searchQuery, archivedOnly],
  });

  const handleExport = useCallback(
    async (book: IBook, format: BookExportFormat) => {
      const res = await clientApiHandlers.books.exportBook(book, format);
      if (res.succeed) {
        toast({
          title: "Export ready",
          description: `${book.name} downloaded as ${format}.`,
        });
        return;
      }
      toast({
        title: "Export failed",
        variant: "destructive",
        description: definedMessages.UNKNOWN_ERROR,
      });
    },
    []
  );

  const tableActionProps: TableActionProps = {
    ...props,
    viewAction: (book) => (
      <Link href={`/dashboard/books/${book.id}`}>View</Link>
    ),
    archiveAction: true,
    deleteAction: true,
    restoreAction: archivedOnly,
    exportFormats: archivedOnly ? undefined : BOOK_EXPORT_FORMATS,
    onExport: archivedOnly ? undefined : handleExport,
    modelName: "Book",
  };

  return (
    <BaseTable
      data={data}
      columns={columns(tableActionProps)}
      toolbarActions={tableActionProps}
      showToolbar={showToolbar}
      hideSearch={hideSearch}
      embedded={!!archivedOnly}
      infiniteScroll={{
        hasMore,
        onLoadMore: loadMore,
        loadingMore,
      }}
    />
  );
}

function columns(rowActions: TableActionProps): ColumnDef<IBook, any>[] {
  const tableCols: ColumnDef<IBook, any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="primary">{row.getValue("name")}</TableCellText>
      ),
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => (
        <TableCellLink
          href={`/dashboard/books/${row.original.id}`}
          variant="primary"
        >
          {row.getValue("slug")}
        </TableCellLink>
      ),
    },
    {
      accessorKey: "abbreviation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Abbreviation" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="secondary" className="font-normal">
          {row.getValue("abbreviation")}
        </TableCellText>
      ),
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="compact" className="font-normal">
          {row.getValue("priority")}
        </TableCellText>
      ),
    },
    {
      id: "chapters",
      accessorFn: (book) => book._count?.chapters ?? 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Chapters" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="compact" className="font-normal">
          {row.original._count?.chapters ?? 0}
        </TableCellText>
      ),
    },
    {
      id: "updatedAt",
      accessorFn: (book) => formatTableDate(book.updatedAt),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="secondary" className="font-normal">
          {formatTableDate(row.original.updatedAt)}
        </TableCellText>
      ),
    },
  ];
  if (
    rowActions.deleteAction ||
    rowActions.viewAction ||
    rowActions.editAction ||
    rowActions.exportFormats?.length
  ) {
    tableCols.push({
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => <DataTableRowActions row={row} {...rowActions} />,
    });
  }
  return tableCols;
}
