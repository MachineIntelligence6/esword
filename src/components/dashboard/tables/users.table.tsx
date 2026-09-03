"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import { useCallback } from "react";
import { IUser } from "@/shared/types/models.types";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";
import { TableCellText } from "./shared/table-cell";
import { formatTableDate } from "./shared/format";
import { useInfiniteList } from "./shared/use-infinite-list";

type Props = Omit<TableActionProps, "modelName"> & {
  archivedOnly?: boolean;
  hideSearch?: boolean;
};

export default function UsersTable({ archivedOnly, hideSearch = false, ...props }: Props) {
  const { data: session } = useSession();
  const searchQuery = useTableSearchStore((state) => state.searchQuery);

  const fetcher = useCallback(
    (page: number, pageSize: number) => {
      if (!session) throw new Error("Session required");
      return clientApiHandlers.users.get({
        page,
        perPage: pageSize,
        ...(session.user.role !== "ADMIN" && {
          where: { role: { not: "ADMIN" } },
        }),
        ...(archivedOnly && { where: { archived: true } }),
        ...(searchQuery && {
          where: {
            OR: [
              { name: { contains: searchQuery } },
              { email: { contains: searchQuery } },
              {
                role: {
                  in: [
                    searchQuery.toUpperCase() === "ADMIN"
                      ? "ADMIN"
                      : searchQuery.toUpperCase() === "EDITOR"
                        ? "EDITOR"
                        : "VIEWER",
                  ],
                },
              },
            ],
          },
        }),
      });
    },
    [session, searchQuery, archivedOnly]
  );

  const { data, hasMore, loadMore, loadingMore } = useInfiniteList<IUser>({
    fetcher,
    deps: [session, searchQuery, archivedOnly],
    enabled: !!session,
  });

  const tableActionProps: TableActionProps = {
    ...props,
    viewAction: (user: IUser) => (
      <Link href={`/dashboard/users/${user.id}`}>View</Link>
    ),
    archiveAction: true,
    deleteAction: true,
    restoreAction: archivedOnly,
    modelName: "User",
  };

  return (
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
  );
}

function columns(rowActions: TableActionProps): ColumnDef<IUser, any>[] {
  const tableCols: ColumnDef<IUser, any>[] = [

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
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="primary">{row.getValue("email")}</TableCellText>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="secondary">{row.getValue("role")}</TableCellText>
      ),
    },
    {
      id: "createdAt",
      accessorFn: (user) => formatTableDate(user.createdAt),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="secondary" className="font-normal">
          {formatTableDate(row.original.createdAt)}
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
