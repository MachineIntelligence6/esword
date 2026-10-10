"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import { useCallback, useState } from "react";
import { IActivity, IBook } from "@/shared/types/models.types";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";
import { TableCellLink, TableCellText } from "./shared/table-cell";
import { useInfiniteList } from "./shared/use-infinite-list";
import { ActivityDetailsPanel } from "../activity-details-panel";

type Props = {
  book?: IBook;
  archivedOnly?: boolean;
  hideSearch?: boolean;
};

export default function ActivitiesTable({ archivedOnly, hideSearch = false }: Props) {
  const { searchQuery } = useTableSearchStore();
  const [selectedActivity, setSelectedActivity] = useState<IActivity | null>(
    null
  );

  const fetcher = useCallback(
    (page: number, pageSize: number) =>
      clientApiHandlers.activities.get({
        page,
        perPage: pageSize,
        include: { user: true },
        where: {
          ...(searchQuery && {
            OR: [
              { description: { contains: searchQuery } },
              { user: { name: { contains: searchQuery } } },
            ],
          }),
        },
      }),
    [searchQuery]
  );

  const { data, hasMore, loadMore, loadingMore } = useInfiniteList<IActivity>({
    fetcher,
    deps: [searchQuery],
  });

  const tableColumns = columns({
    archiveAction: true,
    deleteAction: true,
    restoreAction: archivedOnly,
    modelName: "Activity",
  });

  return (
    <div>
      <BaseTable
        data={data}
        columns={tableColumns}
        hideSearch={hideSearch}
        embedded={!!archivedOnly}
        onRowClick={setSelectedActivity}
        infiniteScroll={{
          hasMore,
          onLoadMore: loadMore,
          loadingMore,
        }}
      />
      <ActivityDetailsPanel
        activity={selectedActivity}
        onOpenChange={(open) => {
          if (!open) setSelectedActivity(null);
        }}
      />
    </div>
  );
}


function columns(rowActions: TableActionProps): ColumnDef<IActivity, any>[] {
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
      id: "datetime",
      accessorFn: (activity) => new Date(activity.timestamp).toLocaleString(),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date/Time" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="secondary">
          {new Date(row.original.timestamp).toLocaleString()}
        </TableCellText>
      ),
    },
    {
      id: "user",
      accessorFn: (activity) => activity.user?.name,
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
      accessorKey: "action",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="compact">{row.getValue("action")}</TableCellText>
      ),
    },
    {
      accessorKey: "model",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Model" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="compact">{row.getValue("model")}</TableCellText>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <TableCellText variant="wide" clamp={2} className="font-normal">
          {row.getValue("description")}
        </TableCellText>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="w-fit">
          <DataTableRowActions row={row} {...rowActions} />
        </div>
      ),
    },
  ];
}
