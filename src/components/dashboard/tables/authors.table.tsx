"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import { useEffect, useState } from "react";
import { PaginatedApiResponse } from "@/shared/types/api.types";
import { TablePagination, perPageCountOptions } from "./shared/pagination";
import clientApiHandlers from "@/client/handlers";
import { IAuthor } from "@/shared/types/models.types";
import Link from "next/link";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";
import { debounce } from "@/lib/utils";

type Props = Omit<TableActionProps, "modelName"> & {
  showPagination?: boolean;
  showToolbar?: boolean;
  archivedOnly?: boolean;
};

export default function AuthorsTable({
  showPagination,
  showToolbar,
  archivedOnly,
  ...props
}: Props) {
  const [tableData, setTableData] = useState<PaginatedApiResponse<
    IAuthor[]
  > | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(perPageCountOptions[0]);
  const searchQuery = useTableSearchStore((state) => state.searchQuery);

  const loadData = async () => {
    setTableData(null);
    const res = await clientApiHandlers.authors.get({
      page: currentPage,
      perPage: perPage,
      //   ...(archivedOnly && { where: { archived: true } }),
      where: {
        OR: [
          { name: { contains: searchQuery } },
          { description: { contains: searchQuery } },
        ],
      },
    });
    setTableData(res);
  };

  const debouncedLoadData = debounce(loadData, 1000);

  useEffect(() => {
    debouncedLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // useEffect for currentPage and perPage without debounce
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage]);

  const pagination: TablePagination = {
    onPageChange: setCurrentPage,
    currentPage: currentPage,
    perPage: perPage,
    setPerPage: setPerPage,
    totalPages: tableData?.pagination?.totalPages ?? 1,
  };

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
      data={tableData?.data}
      columns={columns(tableActionProps)}
      toolbarActions={tableActionProps}
      pagination={pagination}
      showPagination={showPagination}
      showToolbar={showToolbar}
    />
  );
}

function columns(rowActions: TableActionProps): ColumnDef<IAuthor, any>[] {
  const tableCols: ColumnDef<IAuthor, any>[] = [
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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex max-w-[100px] space-x-2">
            <span className="max-w-[100px] truncate font-medium">
              {row.getValue("name")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span className="max-w-[300px] line-clamp-3 font-medium">
              {row.getValue("description")}
            </span>
          </div>
        );
      },
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
