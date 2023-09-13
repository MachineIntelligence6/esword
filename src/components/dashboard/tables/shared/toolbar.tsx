"use client"
import * as React from "react"
import {
    Table as TTable,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cross2Icon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { DataTableViewOptions } from "./table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TableActionPopup, TableActionPopupProps } from "./row-actions";
import { TableActionProps } from "./types";
import { Session } from "next-auth";


export interface ToolbarProps<TData> {
    getFilterValue: (table: TTable<TData>) => string;
    setFilterValue: (table: TTable<TData>, value: string) => void;
    toolbarActions?: TableActionProps
}
interface DataTableToolbarProps<TData> extends ToolbarProps<TData> {
    table: TTable<TData>;
    session?: Session | null;
}

type TableActionPopupState = {
    state: boolean;
    type: "DELETE" | "RESTORE" | "PERMANENT_DELETE"
}
const RESTORE_DESCRIPTION = "This action will restore the selected rows and all data linked with them."
const PERMANENT_DELETE_DESCRIPTION = "This action will delete permanentaly the selected rows and all data linked with them."
const DELETE_DESCRIPTION = "This action will delete the selected rows and all data linked with them."

export function DataTableToolbar<TData>({
    table,
    getFilterValue,
    setFilterValue,
    toolbarActions,
    session
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0
    const [alertOpen, setAlertOpen] = React.useState<TableActionPopupState>({ state: false, type: "RESTORE" });

    const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);


    const restoreAllPopupProps: TableActionPopupProps = {
        title: "Are you sure to restore?",
        description: alertOpen.type === "RESTORE" ? RESTORE_DESCRIPTION : (alertOpen.type === "PERMANENT_DELETE" ? (toolbarActions?.deleteOptions?.message ?? PERMANENT_DELETE_DESCRIPTION) : DELETE_DESCRIPTION),
        actionBtn: { text: (alertOpen.type === "RESTORE" ? "Restore" : "Delete"), variant: (alertOpen.type === "RESTORE" ? "default" : "destructive") },
        open: alertOpen.state, setOpen: (value) => setAlertOpen({ state: value, type: "RESTORE" }),
        action: async () => {
            if (selectedRows.length <= 0) return;
            if (alertOpen.type === "RESTORE") {
                await toolbarActions?.restoreAction?.(selectedRows)
            }
            else if (alertOpen.type === "PERMANENT_DELETE") {
                await toolbarActions?.deleteAction?.(selectedRows)
            }
            else if (alertOpen.type === "DELETE") {
                // await toolbarActions?.deletePermanently?.(selectedRows)
            }
        }
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Search..."
                    value={getFilterValue(table)}
                    onChange={(event) =>
                        setFilterValue(table, event.target.value)
                    }
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
                {
                    (toolbarActions?.restoreAction || toolbarActions?.deleteAction || toolbarActions?.archiveAction) &&
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                            >
                                <DotsHorizontalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                            {
                                toolbarActions.restoreAction &&
                                <DropdownMenuItem
                                    disabled={selectedRows.length <= 0}
                                    onClick={() => setAlertOpen({ state: true, type: "RESTORE" })}>
                                    Restore
                                </DropdownMenuItem>

                            }
                            {
                                toolbarActions.deleteAction && session?.user.role === "ADMIN" &&
                                <DropdownMenuItem
                                    disabled={selectedRows.length <= 0}
                                    onClick={() => setAlertOpen({ state: true, type: "PERMANENT_DELETE" })}>
                                    Delete Permanentaly
                                </DropdownMenuItem>

                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
                <DataTableViewOptions table={table} />
            </div>
            <TableActionPopup {...restoreAllPopupProps} />
        </div >
    )
}





