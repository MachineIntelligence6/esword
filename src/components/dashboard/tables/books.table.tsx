'use client'
import { Checkbox } from "@/components/dashboard/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./shared/table"
import { DataTableRowActions } from "./shared/row-actions"
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import { TablePagination, perPageCountOptions } from "./shared/pagination"
import { useEffect, useState } from "react"
import { PaginatedApiResponse } from "@/shared/types/api.types"
import clientApiHandlers from "@/client/handlers"
import { IBook } from "@/shared/types/models.types"
import Link from "next/link"


type Props = TableActionProps & {
    showPagination?: boolean;
    showToolbar?: boolean;
}

export default function BooksTable({ showPagination, showToolbar, ...props }: Props) {
    const [tableData, setTableData] = useState<PaginatedApiResponse<IBook[]> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(perPageCountOptions[0]);

    const loadData = async () => {
        setTableData(null)
        const res = await clientApiHandlers.books.get({ page: currentPage, perPage: perPage })
        setTableData(res)
    }

    useEffect(() => {
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, perPage])


    const pagination: TablePagination = {
        onPageChange: setCurrentPage,
        currentPage: currentPage,
        perPage: perPage,
        setPerPage: setPerPage,
        totalPages: tableData?.pagination?.totalPages ?? 1
    }

    return (
        <BaseTable
            data={tableData?.data}
            columns={columns(props)}
            pagination={pagination}
            showPagination={showPagination}
            showToolbar={showToolbar}
            getFilterValue={(table) => (table.getColumn("name")?.getFilterValue() as string ?? "")}
            setFilterValue={(table, value) => {
                table.getColumn("name")?.setFilterValue(value)
            }} />
    )
}




function columns(rowActions: TableActionProps): ColumnDef<IBook, any>[] {
    const tableCols: ColumnDef<IBook, any>[] = [
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
                )
            },
        },
        {
            accessorKey: "slug",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Slug" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <Link href={`/dashboard/books/${row.original.id}`}
                            className="max-w-[100px] text-primary truncate font-normal">
                            {row.getValue("slug")}
                        </Link>
                    </div>
                )
            }
        },
        {
            accessorKey: "abbreviation",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Abbreviation" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <span className="max-w-[100px] truncate font-normal">
                            {row.getValue("abbreviation")}
                        </span>
                    </div>
                )
            }
        },

    ]
    if (rowActions.deleteAction || rowActions.viewAction || rowActions.editAction) {
        tableCols.push({
            id: "actions",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Actions" />
            ),
            cell: ({ row }) => <DataTableRowActions row={row} {...rowActions} />,
        })
    }
    return tableCols
}
