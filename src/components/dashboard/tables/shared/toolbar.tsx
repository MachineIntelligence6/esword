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


export interface ToolbarProps<TData> {
    getFilterValue: (table: TTable<TData>) => string;
    setFilterValue: (table: TTable<TData>, value: string) => void;
    toolbarActions?: {
        restore?: (rows: any[]) => Promise<void>;
        delete?: () => Promise<void>;
    }
}
interface DataTableToolbarProps<TData> extends ToolbarProps<TData> {
    table: TTable<TData>;
}

export function DataTableToolbar<TData>({
    table,
    getFilterValue,
    setFilterValue,
    toolbarActions
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0
    const [alertOpen, setAlertOpen] = React.useState(false);

    const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);


    const restoreAllPopupProps: TableActionPopupProps = {
        title: "Are you sure to restore?",
        description: "This action will restore all selected rows and all data linked with them.",
        actionBtn: { text: "Restore", variant: "default" },
        open: alertOpen, setOpen: setAlertOpen,
        action: async () => {
            if (selectedRows.length <= 0) return;
            await toolbarActions?.restore?.(selectedRows)
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
                    (toolbarActions?.restore || toolbarActions?.delete) &&
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                            >
                                <DotsHorizontalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                            {
                                toolbarActions.restore &&
                                <DropdownMenuItem
                                    disabled={selectedRows.length <= 0}
                                    onClick={() => setAlertOpen(true)}>
                                    Restore Selected
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





