"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import Link from "next/link";
import { useCallback } from "react";
import { IBook, IChapter } from "@/shared/types/models.types";
import { extractTextFromHtml } from "@/lib/utils";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";
import { TableCellLink, TableCellText } from "./shared/table-cell";
import { useInfiniteList } from "./shared/use-infinite-list";

type Props = {
  book?: IBook;
  bookId?: number;
  bookIds?: number[];
  archivedOnly?: boolean;
  hideSearch?: boolean;
  editAction?: TableActionProps["editAction"];
};

export default function ChaptersTable({
  book,
  bookId,
  bookIds,
  archivedOnly,
  hideSearch = false,
  editAction,
}: Props) {
  const filterBookIds = book
    ? [book.id]
    : bookIds && bookIds.length > 0
      ? bookIds
      : bookId
        ? [bookId]
        : [];
  const scopedToSingleBook = !!book || filterBookIds.length === 1;
  const { searchQuery } = useTableSearchStore();
  const filterKey = filterBookIds.join(",");

  const fetcher = useCallback(
    (page: number, pageSize: number) =>
      clientApiHandlers.chapters.get({
        page,
        perPage: pageSize,
        include: { book: true, _count: { select: { topics: true } } },
        book: filterBookIds.length === 1 ? filterBookIds[0] : undefined,
        where: {
          ...(filterBookIds.length > 1
            ? { bookId: { in: filterBookIds } }
            : {}),
          ...(searchQuery && {
            OR: [
              ...(isNaN(parseInt(searchQuery))
                ? []
                : [{ name: { equals: parseInt(searchQuery) } }]),
              { slug: { contains: searchQuery } },
              { commentaryName: { contains: searchQuery } },
              { commentaryText: { contains: searchQuery } },
              { book: { name: { contains: searchQuery } } },
            ],
          }),
          ...(archivedOnly && { archived: true }),
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey, searchQuery, archivedOnly]
  );

  const { data, hasMore, loadMore, loadingMore } = useInfiniteList<IChapter>({
    fetcher,
    deps: [filterKey, searchQuery, archivedOnly],
  });

  const tableActionProps: TableActionProps = {
    viewAction: (chapter) => (
      <Link href={`/dashboard/chapters/${chapter.id}`}>View</Link>
    ),
    editAction:
      editAction ??
      ((chapter) => (
        <Link href={`/dashboard/chapters/${chapter.id}/edit`}>Edit</Link>
      )),
    archiveAction: true,
    deleteAction: true,
    restoreAction: archivedOnly,
    modelName: "Chapter",
  };

  return (
    <div>
      <BaseTable
        data={data}
        columns={columns(tableActionProps, scopedToSingleBook && !!book)}
        toolbarActions={tableActionProps}
        hideSearch={hideSearch}
        embedded={!!archivedOnly}
        infiniteScroll={{
          hasMore,
          onLoadMore: loadMore,
          loadingMore,
        }}
      />
    </div>
  );
}

function columns(
  rowActions: TableActionProps,
  hideBookColumn: boolean
): ColumnDef<IChapter, any>[] {
  const cols: ColumnDef<IChapter, any>[] = [

    {
      id: "name",
      accessorFn: (chapter) => String(chapter.name),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="compact">{row.original.name}</TableCellText>
      ),
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => (
        <TableCellLink
          href={`/dashboard/chapters/${row.original.id}`}
          variant="primary"
        >
          {row.getValue("slug")}
        </TableCellLink>
      ),
    },
    {
      accessorKey: "commentaryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Commentary Name" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="secondary">
          {row.original.commentaryName}
        </TableCellText>
      ),
    },
    {
      id: "commentaryText",
      accessorFn: (chapter) =>
        extractTextFromHtml(chapter.commentaryText ?? ""),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Commentary Text" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="wide" clamp={2} className="font-normal">
          {extractTextFromHtml(row.original.commentaryText ?? "")}
        </TableCellText>
      ),
    },
  ];

  cols.push({
    id: "topics",
    accessorFn: (chapter) => chapter._count?.topics ?? 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Topics" />
    ),
    cell: ({ row }) => (
      <TableCellText variant="compact" className="font-normal">
        {row.original._count?.topics ?? 0}
      </TableCellText>
    ),
  });

  if (!hideBookColumn) {
    cols.push({
      id: "book",
      accessorFn: (chapter) => chapter.book?.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Book" />
      ),
      cell: ({ row }) => {
        const archived = row.original.book?.archived ?? true;
        return (
          <TableCellLink
            href={`/dashboard/books/${row.original.bookId}`}
            disabled={archived}
            variant="secondary"
          >
            {row.original.book?.name}
          </TableCellLink>
        );
      },
    });
  }

  cols.push({
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} {...rowActions} />,
  });

  return cols;
}
