"use client";
import * as React from "react";
import { Table as TTable } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cross2Icon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { DataTableViewOptions } from "./table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableActionPopup, TableActionPopupProps } from "./row-actions";
import { TableActionProps } from "./types";
import { Session } from "next-auth";
import { Prisma } from "@prisma/client";
import tableActions, {
  ARCHIVE_DESCRIPTION,
  DELETE_DESCRIPTION,
  RESTORE_DESCRIPTION,
} from "./table-actions";

export interface ToolbarProps<TData> {
  // getFilterValue: (table: TTable<TData>) => string;

  toolbarActions?: TableActionProps;
}
interface DataTableToolbarProps<TData> extends ToolbarProps<TData> {
  table: TTable<TData>;
  session?: Session | null;
  filterValue: string;
  setFilterValue: (value: string) => void;
}

export type TableActionPopupState = {
  state: boolean;
  type: "ARCHIVE" | "RESTORE" | "DELETE";
};

export function DataTableToolbar<TData>({
  table,
  filterValue,
  setFilterValue,
  toolbarActions,
  session,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [alertOpen, setAlertOpen] = React.useState<TableActionPopupState>({
    state: false,
    type: "RESTORE",
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  const warningMessage = () => {
    if (!toolbarActions?.modelName) return "";
    if (alertOpen.type === "RESTORE")
      return `This action will restore the ${toolbarActions.modelName.toLowerCase()}(s) and all data linked with them.`;
    if (alertOpen.type === "ARCHIVE")
      return `This action will move the ${toolbarActions.modelName.toLowerCase()}(s) and all data linked with them to archive.`;
    if (alertOpen.type === "DELETE")
      return `This action will delete (permanantly) the ${toolbarActions.modelName.toLowerCase()}(s) and all data linked with them.`;
  };

  const actionPopupProps: TableActionPopupProps = {
    title: "Warning!",
    description: warningMessage() ?? "",
    actionBtn: {
      text: "Continue",
      variant: alertOpen.type === "RESTORE" ? "default" : "destructive",
    },
    open: alertOpen.state,
    setOpen: (value) => setAlertOpen({ state: value, type: "RESTORE" }),
    action: async () => {
      if (selectedRows.length <= 0 || !toolbarActions) return;
      if (alertOpen.type === "RESTORE") {
        await tableActions.restore(
          selectedRows,
          toolbarActions.modelName,
          `Restored successfully.`
        );
      } else if (alertOpen.type === "DELETE") {
        await tableActions.deletePermanantly(
          selectedRows,
          toolbarActions.modelName,
          `Selected ${toolbarActions.modelName}(s) and all data linked with them deleted successfully.`
        );
      } else if (alertOpen.type === "ARCHIVE") {
        await tableActions.archive(
          selectedRows,
          toolbarActions.modelName,
          `Selected ${toolbarActions.modelName}(s) and all data linked with them moved to archive successfully.`
        );
      }
    },
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search..."
          value={filterValue}
          onChange={(event) => {
            console.log("event", event.target.value);
            setFilterValue(event.target.value);
          }}
          type="text"
          className="h-8 w-[150px] lg:w-[250px]"
        />
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
      <div className="flex items-center gap-3">
        {(toolbarActions?.restoreAction ||
          toolbarActions?.deleteAction ||
          toolbarActions?.archiveAction) &&
          session?.user.role === "ADMIN" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={
                    selectedRows?.length <= 0 ||
                    (!toolbarActions.restoreAction &&
                      !toolbarActions.deleteAction &&
                      !toolbarActions.archiveAction)
                  }
                  variant="ghost"
                  className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                  <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[250px]">
                {toolbarActions.restoreAction ? (
                  <DropdownMenuItem
                    disabled={selectedRows.length <= 0}
                    onClick={() =>
                      setAlertOpen({ state: true, type: "RESTORE" })
                    }
                  >
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    disabled={selectedRows.length <= 0}
                    onClick={() =>
                      setAlertOpen({ state: true, type: "ARCHIVE" })
                    }
                  >
                    Archive
                  </DropdownMenuItem>
                )}
                {toolbarActions.deleteAction && (
                  <DropdownMenuItem
                    disabled={selectedRows.length <= 0}
                    onClick={() =>
                      setAlertOpen({ state: true, type: "DELETE" })
                    }
                  >
                    Delete (Permanently)
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        <DataTableViewOptions table={table} />
      </div>
      <TableActionPopup {...actionPopupProps} />
    </div>
  );
}
