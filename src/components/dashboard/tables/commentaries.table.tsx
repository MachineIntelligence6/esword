"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import Link from "next/link";
import { useCallback } from "react";
import { IAuthor, ICommentary, IVerse } from "@/shared/types/models.types";
import { extractTextFromHtml } from "@/lib/utils";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";
import { TableCellLink, TableCellText } from "./shared/table-cell";
import { formatTableDate } from "./shared/format";
import { useInfiniteList } from "./shared/use-infinite-list";

type Props = {
  author?: IAuthor;
  verse?: IVerse;
  bookId?: number;
  bookIds?: number[];
  chapterId?: number;
  chapterIds?: number[];
  archivedOnly?: boolean;
  hideSearch?: boolean;
  editAction?: TableActionProps["editAction"];
};

export default function CommentariesTable({
  author,
  verse,
  bookId,
  bookIds,
  chapterId,
  chapterIds,
  archivedOnly,
  hideSearch = false,
  editAction,
}: Props) {
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
      clientApiHandlers.commentaries.get({
        page,
        perPage: pageSize,
        include: {
          author: true,
          verse: {
            include: {
              topic: { include: { chapter: { include: { book: true } } } },
            },
          },
        },
        author: author?.id,
        verse: verse?.id,
        where: {
          ...(filterChapterIds.length > 0
            ? {
                verse: {
                  topic: {
                    chapterId:
                      filterChapterIds.length === 1
                        ? filterChapterIds[0]
                        : { in: filterChapterIds },
                  },
                },
              }
            : filterBookIds.length > 0
              ? {
                  verse: {
                    topic: {
                      chapter: {
                        bookId:
                          filterBookIds.length === 1
                            ? filterBookIds[0]
                            : { in: filterBookIds },
                      },
                    },
                  },
                }
              : {}),
          ...(searchQuery
            ? {
                OR: [
                  { name: { contains: searchQuery } },
                  { text: { contains: searchQuery } },
                  { author: { name: { contains: searchQuery } } },
                  ...(isNaN(parseInt(searchQuery))
                    ? []
                    : [
                        {
                          verse: { number: { equals: parseInt(searchQuery) } },
                        },
                      ]),
                  { verse: { topic: { name: { contains: searchQuery } } } },
                  {
                    verse: {
                      topic: {
                        chapter: {
                          book: { abbreviation: { contains: searchQuery } },
                        },
                      },
                    },
                  },
                ],
              }
            : {}),
          ...(archivedOnly && { archived: true }),
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [author?.id, verse?.id, chapterKey, bookKey, searchQuery, archivedOnly]
  );

  const { data, hasMore, loadMore, loadingMore } = useInfiniteList<ICommentary>({
    fetcher,
    deps: [author?.id, verse?.id, chapterKey, bookKey, searchQuery, archivedOnly],
  });

  const tableActionProps: TableActionProps = {
    viewAction: (commentary: ICommentary) => (
      <Link href={`/dashboard/commentaries/${commentary.id}`}>View</Link>
    ),
    editAction:
      editAction ??
      ((commentary: ICommentary) => (
        <Link href={`/dashboard/commentaries/${commentary.id}/edit`}>Edit</Link>
      )),
    archiveAction: true,
    deleteAction: true,
    restoreAction: archivedOnly,
    modelName: "Commentary",
  };

  return (
    <div>
      <BaseTable
        data={data}
        columns={columns(tableActionProps)}
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

function columns(rowActions: TableActionProps): ColumnDef<ICommentary, any>[] {
  return [

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
      id: "text",
      accessorFn: (commentary) => extractTextFromHtml(commentary.text),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Text" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="wide" clamp={2} className="font-normal">
          {extractTextFromHtml(String(row.getValue("text") ?? ""))}
        </TableCellText>
      ),
    },
    {
      id: "author",
      accessorFn: (commentary) => commentary.author?.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Author" />
      ),
      cell: ({ row }) => {
        const archived = row.original.author?.archived ?? true;
        return (
          <TableCellLink
            href={`/dashboard/authors/${row.original.author?.id}`}
            disabled={archived}
            variant="secondary"
          >
            {row.original.author?.name}
          </TableCellLink>
        );
      },
    },
    {
      id: "book",
      accessorFn: (commentary) => commentary.verse?.topic?.chapter?.book?.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Book" />
      ),
      cell: ({ row }) => {
        const book = row.original.verse?.topic?.chapter?.book;
        const archived = book?.archived ?? true;
        return (
          <TableCellLink
            href={`/dashboard/books/${book?.id}`}
            disabled={archived || !book?.id}
            variant="secondary"
          >
            {book?.name}
          </TableCellLink>
        );
      },
    },
    {
      id: "verse",
      accessorFn: (commentary) => {
        const chapter = commentary.verse?.topic?.chapter;
        return `${chapter?.book?.abbreviation} ${chapter?.name}:${commentary.verse?.number}`;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Verse" />
      ),
      cell: ({ row }) => {
        const archived = row.original.verse?.archived ?? true;
        const chapter = row.original.verse?.topic?.chapter;
        const label = `${chapter?.book?.abbreviation} ${chapter?.name}:${row.original.verse?.number}`;
        return (
          <TableCellLink
            href={`/dashboard/verses/${row.original.verseId}`}
            disabled={archived}
            variant="secondary"
            title={label}
          >
            {label}
          </TableCellLink>
        );
      },
    },
    {
      id: "updatedAt",
      accessorFn: (commentary) => formatTableDate(commentary.updatedAt),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="secondary" className="font-normal">
          {formatTableDate(row.original.updatedAt)}
        </TableCellText>
      ),
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
