"use client";

import * as React from "react";
import {
  Table as TTable,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  Column,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
  MixerHorizontalIcon,
} from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Spinner from "@/components/spinner";
import { DataTableToolbar, ToolbarProps } from "./toolbar";
import { useSession } from "next-auth/react";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";

export type InfiniteScrollProps = {
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore?: boolean;
};

interface DataTableProps<TData, TValue> extends ToolbarProps<TData> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[] | null;
  rowsCount?: number;
  showToolbar?: boolean;
  hideSearch?: boolean;
  /** Sit inside a parent card (e.g. Archives tabs) — no second outer border. */
  embedded?: boolean;
  infiniteScroll?: InfiniteScrollProps;
}

export function BaseTable<TData, TValue>({
  columns,
  data,
  showToolbar = true,
  hideSearch = false,
  embedded = false,
  infiniteScroll,
  ...toolbarProps
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>(() => {
    const hasPriorityColumn = columns.some((column) => {
      const columnId =
        ("id" in column && column.id) ||
        ("accessorKey" in column && String(column.accessorKey));
      return columnId === "priority";
    });
    return hasPriorityColumn ? [{ id: "priority", desc: false }] : [];
  });

  const { data: session } = useSession();
  const { searchQuery } = useTableSearchStore();
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter: searchQuery,
    },
    enableRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
  });

  React.useEffect(() => {
    if (!infiniteScroll?.hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          infiniteScroll.onLoadMore();
        }
      },
      { root: null, rootMargin: "240px", threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [infiniteScroll?.hasMore, infiniteScroll?.onLoadMore, data?.length]);

  return (
    <div className="space-y-4 w-full">
      {showToolbar && (
        <DataTableToolbar
          table={table}
          session={session}
          hideSearch={hideSearch}
          {...toolbarProps}
        />
      )}
      <div
        className={
          embedded
            ? "bg-white"
            : "rounded-sm border border-slate-200 bg-white"
        }
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : data ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-slate-500"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 py-40">
                  <div className="flex items-center justify-center">
                    <Spinner className="w-20" />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {infiniteScroll && data && data.length > 0 && (
          <div className="border-t border-slate-200 px-4 py-3">
            <p className="text-center text-sm text-slate-600">
              Showing {data.length} rows
              {!infiniteScroll.hasMore ? "" : ""}
            </p>
            <div
              ref={sentinelRef}
              className="mt-2 flex min-h-[1.25rem] items-center justify-center gap-2"
              aria-live="polite"
            >
              {infiniteScroll.loadingMore && (
                <Spinner className="h-5 w-5 border-2" />
              )}
              {!infiniteScroll.hasMore && (
                <span className="text-xs text-slate-500">All rows loaded</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-sm font-semibold text-slate-500", className)}>{title}</div>;
  }

  return (
    <button
      type="button"
      className={cn(
        "-ml-1 inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950",
        className
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span>{title}</span>
      {column.getIsSorted() === "desc" ? (
        <ArrowDownIcon className="h-3.5 w-3.5" />
      ) : column.getIsSorted() === "asc" ? (
        <ArrowUpIcon className="h-3.5 w-3.5" />
      ) : (
        <CaretSortIcon className="h-3.5 w-3.5 opacity-50" />
      )}
    </button>
  );
}

interface DataTableViewOptionsProps<TData> {
  table: TTable<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 flex">
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[170px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
