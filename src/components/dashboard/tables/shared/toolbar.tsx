"use client";
import * as React from "react";
import { Table as TTable } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { TableActionProps } from "./types";
import { Session } from "next-auth";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";

export interface ToolbarProps<TData> {
  toolbarActions?: TableActionProps;
  hideSearch?: boolean;
}
interface DataTableToolbarProps<TData> extends ToolbarProps<TData> {
  table: TTable<TData>;
  session?: Session | null;
}

export type TableActionPopupState = {
  state: boolean;
  type: "ARCHIVE" | "RESTORE" | "DELETE";
};

export function DataTableToolbar<TData>({
  table,
  hideSearch = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const { searchQuery, setSearchQuery } = useTableSearchStore();

  if (hideSearch && !isFiltered) return null;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-1 items-center space-x-2">
        {!hideSearch && (
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
            }}
            type="text"
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
