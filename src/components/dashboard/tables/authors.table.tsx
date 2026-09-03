"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import { useCallback } from "react";
import clientApiHandlers from "@/client/handlers";
import { IAuthor } from "@/shared/types/models.types";
import Link from "next/link";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";
import { TableCellText } from "./shared/table-cell";
import { useInfiniteList } from "./shared/use-infinite-list";

type Props = Omit<TableActionProps, "modelName"> & {
  showToolbar?: boolean;
  archivedOnly?: boolean;
  hideSearch?: boolean;
};

export default function AuthorsTable({
  showToolbar,
  archivedOnly,
  hideSearch = false,
  ...props
}: Props) {
  const searchQuery = useTableSearchStore((state) => state.searchQuery);

  const fetcher = useCallback(
    (page: number, pageSize: number) =>
      clientApiHandlers.authors.get({
        page,
        perPage: pageSize,
        include: { _count: { select: { commentaries: true } } },
        where: {
          ...(archivedOnly && { archived: true }),
          OR: [
            { name: { contains: searchQuery } },
            { description: { contains: searchQuery } },
          ],
        },
      }),
    [searchQuery, archivedOnly]
  );

  const { data, hasMore, loadMore, loadingMore } = useInfiniteList<IAuthor>({
    fetcher,
    deps: [searchQuery, archivedOnly],
  });

  const tableActionProps: TableActionProps = {
    ...props,
    viewAction: (author: IAuthor) => (
      <Link href={`/dashboard/authors/${author.id}`}>View</Link>
    ),
    archiveAction: true,
    deleteAction: true,
    restoreAction: archivedOnly,
    modelName: "Author",
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

function columns(rowActions: TableActionProps): ColumnDef<IAuthor, any>[] {
  const tableCols: ColumnDef<IAuthor, any>[] = [

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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="primary">{row.getValue("name")}</TableCellText>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="wide" clamp={3}>
          {row.getValue("description")}
        </TableCellText>
      ),
    },
    {
      id: "commentaries",
      accessorFn: (author) => author._count?.commentaries ?? 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Commentaries" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="compact" className="font-normal">
          {row.original._count?.commentaries ?? 0}
        </TableCellText>
      ),
    },
  ];
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
