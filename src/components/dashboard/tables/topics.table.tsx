"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import { useCallback } from "react";
import clientApiHandlers from "@/client/handlers";
import { IChapter, ITopic } from "@/shared/types/models.types";
import Link from "next/link";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";
import { TableCellLink, TableCellText } from "./shared/table-cell";
import { useInfiniteList } from "./shared/use-infinite-list";

type Props = Omit<TableActionProps, "modelName"> & {
  chapter?: IChapter;
  chapterId?: number;
  chapterIds?: number[];
  bookId?: number;
  bookIds?: number[];
  archivedOnly?: boolean;
  hideSearch?: boolean;
};

export default function TopicsTable({
  chapter,
  chapterId,
  chapterIds,
  bookId,
  bookIds,
  archivedOnly,
  hideSearch = false,
  ...props
}: Props) {
  const scopedChapterId = chapter?.id ?? chapterId;
  const filterChapterIds =
    scopedChapterId
      ? [scopedChapterId]
      : chapterIds && chapterIds.length > 0
        ? chapterIds
        : [];
  const filterBookIds =
    bookIds && bookIds.length > 0 ? bookIds : bookId ? [bookId] : [];
  const { searchQuery } = useTableSearchStore();
  const chapterKey = filterChapterIds.join(",");
  const bookKey = filterBookIds.join(",");

  const fetcher = useCallback(
    (page: number, pageSize: number) =>
      clientApiHandlers.topics.get({
        page,
        perPage: pageSize,
        chapter: filterChapterIds.length === 1 ? filterChapterIds[0] : undefined,
        include: {
          chapter: { include: { book: true } },
          _count: { select: { verses: true } },
        },
        where: {
          ...(filterChapterIds.length > 1
            ? { chapterId: { in: filterChapterIds } }
            : filterChapterIds.length === 0 && filterBookIds.length > 0
              ? {
                  chapter: {
                    bookId:
                      filterBookIds.length === 1
                        ? filterBookIds[0]
                        : { in: filterBookIds },
                  },
                }
              : {}),
          ...(searchQuery && {
            OR: [
              { name: { contains: searchQuery } },
              ...(isNaN(parseInt(searchQuery))
                ? []
                : [{ number: { equals: parseInt(searchQuery) } }]),
              { chapter: { book: { name: { contains: searchQuery } } } },
            ],
          }),
          ...(archivedOnly && { archived: true }),
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chapterKey, bookKey, searchQuery, archivedOnly]
  );

  const { data, hasMore, loadMore, loadingMore } = useInfiniteList<ITopic>({
    fetcher,
    deps: [chapterKey, bookKey, searchQuery, archivedOnly],
  });

  const tableActionProps: TableActionProps = {
    ...props,
    viewAction: (topic: ITopic) => (
      <Link href={`/dashboard/topics/${topic.id}`}>View</Link>
    ),
    archiveAction: true,
    deleteAction: true,
    restoreAction: archivedOnly,
    modelName: "Topic",
  };

  return (
    <BaseTable
      data={data}
      columns={columns(tableActionProps, !!chapter)}
      toolbarActions={tableActionProps}
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

function columns(
  rowActions: TableActionProps,
  hideChapterColumn: boolean
): ColumnDef<ITopic, any>[] {
  const tableCols: ColumnDef<ITopic, any>[] = [

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
      accessorKey: "number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Number" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="compact" className="font-normal">
          {row.getValue("number")}
        </TableCellText>
      ),
    },
  ];

  tableCols.push({
    id: "verses",
    accessorFn: (topic) => topic._count?.verses ?? 0,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Verses" />
    ),
    cell: ({ row }) => (
      <TableCellText variant="compact" className="font-normal">
        {row.original._count?.verses ?? 0}
      </TableCellText>
    ),
  });

  if (!hideChapterColumn) {
    tableCols.push({
      id: "chapter",
      accessorFn: (topic) =>
        `${topic.chapter?.book?.name} / ${topic.chapter?.name}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Chapter" />
      ),
      cell: ({ row }) => {
        const archived = row.original.chapter?.archived ?? true;
        const label = `${row.original.chapter?.book?.name} / ${row.original.chapter?.name}`;
        return (
          <TableCellLink
            href={`/dashboard/chapters/${row.original.chapterId}`}
            disabled={archived}
            variant="secondary"
            title={label}
          >
            {label}
          </TableCellLink>
        );
      },
    });
  }

  if (
    rowActions.deleteAction ||
    rowActions.viewAction ||
    rowActions.editAction
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
