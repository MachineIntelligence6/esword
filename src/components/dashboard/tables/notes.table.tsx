"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/ui/use-toast";
import { useCallback } from "react";
import { INote, IUser, IVerse } from "@/shared/types/models.types";
import Link from "next/link";
import { extractTextFromHtml } from "@/lib/utils";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";
import { TableCellLink, TableCellText } from "./shared/table-cell";
import { formatTableDate } from "./shared/format";
import { useInfiniteList } from "./shared/use-infinite-list";

type Props = {
  user?: any;
  verse?: IVerse;
  editAction?: TableActionProps["editAction"];
  hideSearch?: boolean;
};

export default function NotesTable({ user, verse, editAction, hideSearch = false }: Props) {
  const searchQuery = useTableSearchStore((state) => state.searchQuery);

  const fetcher = useCallback(
    (page: number, pageSize: number) =>
      clientApiHandlers.notes.get({
        page,
        perPage: pageSize,
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
            ...(isNaN(parseInt(searchQuery))
              ? []
              : [{ verse: { number: { equals: parseInt(searchQuery) } } }]),
            { verse: { topic: { name: { contains: searchQuery } } } },
          ],
        },
      }),
    [user?.id, verse?.id, searchQuery]
  );

  const { data, hasMore, loadMore, loadingMore } = useInfiniteList<INote>({
    fetcher,
    deps: [user?.id, verse?.id, searchQuery],
  });

  const tableColumns = columns({
    viewAction: (note: INote) => (
      <Link href={`/dashboard/notes/${note.id}`}>View</Link>
    ),
    editAction:
      editAction ??
      ((note: INote) => (
        <Link href={`/dashboard/notes/${note.id}/edit`}>Edit</Link>
      )),
    // archiveAction: true,
    // deleteAction: true,
    // restoreAction: archivedOnly,
    modelName: "Note",
  });

  return (
    <div>
      <BaseTable
        data={data}
        columns={tableColumns}
        hideSearch={hideSearch}
        infiniteScroll={{
          hasMore,
          onLoadMore: loadMore,
          loadingMore,
        }}
      />
    </div>
  );
}

function columns(rowActions: TableActionProps): ColumnDef<INote, any>[] {
  return [

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
      cell: ({ row }) => (
        <TableCellText variant="wide" clamp={2}>
          {extractTextFromHtml(row.original.text)}
        </TableCellText>
      ),
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
          <TableCellLink
            href={`/dashboard/users/${row.original.userId}`}
            disabled={archived}
            variant="secondary"
          >
            {row.original.user?.name}
          </TableCellLink>
        );
      },
    },
    {
      id: "book",
      accessorFn: (note) => {
        const book = note.verse?.topic?.chapter?.book;
        return book?.abbreviation ?? book?.name;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Book" />
      ),
      cell: ({ row }) => {
        const book = row.original.verse?.topic?.chapter?.book;
        const label = book?.abbreviation ?? book?.name;
        const archived = book?.archived ?? true;
        return (
          <TableCellLink
            href={`/dashboard/books/${book?.id}`}
            disabled={archived || !book?.id}
            variant="secondary"
          >
            {label}
          </TableCellLink>
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
      id: "createdAt",
      accessorFn: (note) => formatTableDate(note.createdAt),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="secondary" className="font-normal">
          {formatTableDate(row.original.createdAt)}
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
