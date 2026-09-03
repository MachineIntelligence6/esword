"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import Link from "next/link";
import { useCallback } from "react";
import { ITopic, IVerse } from "@/shared/types/models.types";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";
import { TableCellLink, TableCellText } from "./shared/table-cell";
import { useInfiniteList } from "./shared/use-infinite-list";

export default function VersesTable({
  topic,
  topicId,
  bookId,
  bookIds,
  chapterId,
  chapterIds,
  archivedOnly,
  hideSearch = false,
  editAction,
}: {
  topic?: ITopic;
  topicId?: number;
  bookId?: number;
  bookIds?: number[];
  chapterId?: number;
  chapterIds?: number[];
  archivedOnly?: boolean;
  hideSearch?: boolean;
  editAction?: TableActionProps["editAction"];
}) {
  const scopedTopicId = topic?.id ?? topicId;
  const filterChapterIds =
    chapterIds && chapterIds.length > 0
      ? chapterIds
      : chapterId
        ? [chapterId]
        : [];
  const filterBookIds =
    bookIds && bookIds.length > 0 ? bookIds : bookId ? [bookId] : [];
  const searchQuery = useTableSearchStore((state) => state.searchQuery);
  const chapterKey = filterChapterIds.join(",");
  const bookKey = filterBookIds.join(",");

  const fetcher = useCallback(
    (page: number, pageSize: number) =>
      clientApiHandlers.verses.get({
        page,
        perPage: pageSize,
        topic: scopedTopicId,
        include: {
          topic: { include: { chapter: { include: { book: true } } } },
          _count: { select: { commentaries: true, notes: true } },
        },
        where: {
          ...(!scopedTopicId && filterChapterIds.length > 0
            ? {
                topic: {
                  chapterId:
                    filterChapterIds.length === 1
                      ? filterChapterIds[0]
                      : { in: filterChapterIds },
                },
              }
            : !scopedTopicId && filterBookIds.length > 0
              ? {
                  topic: {
                    chapter: {
                      bookId:
                        filterBookIds.length === 1
                          ? filterBookIds[0]
                          : { in: filterBookIds },
                    },
                  },
                }
              : {}),
          ...(searchQuery && {
            OR: [
              { text: { contains: searchQuery } },
              ...(isNaN(parseInt(searchQuery))
                ? []
                : [{ number: { equals: parseInt(searchQuery) } }]),
              { topic: { name: { contains: searchQuery } } },
              {
                topic: { chapter: { commentaryText: { contains: searchQuery } } },
              },
              {
                topic: {
                  chapter: { book: { abbreviation: { contains: searchQuery } } },
                },
              },
              ...(isNaN(parseInt(searchQuery))
                ? []
                : [
                    {
                      topic: {
                        chapter: { name: { equals: parseInt(searchQuery) } },
                      },
                    } as const,
                  ]),
              {
                topic: { chapter: { book: { name: { contains: searchQuery } } } },
              },
              ...(isNaN(parseInt(searchQuery))
                ? []
                : [{ topicId: { equals: parseInt(searchQuery) } }]),
              ...(isNaN(parseInt(searchQuery))
                ? []
                : [{ topic: { chapterId: { equals: parseInt(searchQuery) } } }]),
            ],
          }),
          ...(archivedOnly && { archived: true }),
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scopedTopicId, chapterKey, bookKey, searchQuery, archivedOnly]
  );

  const { data, hasMore, loadMore, loadingMore } = useInfiniteList<IVerse>({
    fetcher,
    deps: [scopedTopicId, chapterKey, bookKey, searchQuery, archivedOnly],
  });

  const tableActionProps: TableActionProps = {
    viewAction: (verse: IVerse) => (
      <Link href={`/dashboard/verses/${verse.id}`}>View</Link>
    ),
    editAction:
      editAction ??
      ((verse: IVerse) => (
        <Link href={`/dashboard/verses/${verse.id}/edit`}>Edit</Link>
      )),
    archiveAction: true,
    deleteAction: true,
    restoreAction: archivedOnly,
    modelName: "Verse",
  };

  return (
    <div>
      <BaseTable
        data={data}
        columns={columns(tableActionProps, !!topic)}
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
  hideTopicColumns: boolean
): ColumnDef<IVerse, any>[] {
  const cols: ColumnDef<IVerse, any>[] = [

    {
      id: "name",
      accessorFn: (verse) => {
        const chapter = verse.topic?.chapter;
        return `${chapter?.book?.abbreviation} ${chapter?.name}:${verse.number}`;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const chapter = row.original.topic?.chapter;
        const label = `${chapter?.book?.abbreviation} ${chapter?.name}:${row.original?.number}`;
        return <TableCellText variant="secondary">{label}</TableCellText>;
      },
    },
    {
      accessorKey: "text",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Text" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="wide" clamp={2} className="font-normal">
          {row.getValue("text")}
        </TableCellText>
      ),
    },
  ];

  if (!hideTopicColumns) {
    cols.push(
      {
        id: "topic",
        accessorFn: (verse) => verse.topic?.name,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Topic" />
        ),
        cell: ({ row }) => {
          const archived = row.original.topic?.archived ?? true;
          return (
            <TableCellLink
              href={`/dashboard/topics/${row.original.topicId}`}
              disabled={archived}
              variant="secondary"
            >
              {row.original.topic?.name}
            </TableCellLink>
          );
        },
      },
      {
        id: "chapter",
        accessorFn: (verse) =>
          `${verse.topic?.chapter?.book?.name}/${verse.topic?.chapter?.name}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Chapter" />
        ),
        cell: ({ row }) => {
          const archived = row.original.topic?.chapter?.archived ?? true;
          const label = `${row.original.topic?.chapter?.book?.name}/${row.original.topic?.chapter?.name}`;
          return (
            <TableCellLink
              href={`/dashboard/chapters/${row.original.topic?.chapter?.id}`}
              disabled={archived}
              variant="secondary"
              title={label}
            >
              {label}
            </TableCellLink>
          );
        },
      }
    );
  }

  cols.push(
    {
      id: "commentaries",
      accessorFn: (verse) => verse._count?.commentaries ?? 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Commentaries" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="compact" className="font-normal">
          {row.original._count?.commentaries ?? 0}
        </TableCellText>
      ),
    },
    {
      id: "notes",
      accessorFn: (verse) => verse._count?.notes ?? 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Notes" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="compact" className="font-normal">
          {row.original._count?.notes ?? 0}
        </TableCellText>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => <DataTableRowActions row={row} {...rowActions} />,
    }
  );

  return cols;
}
