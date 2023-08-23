'use client'
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./shared/table"
import { DataTableRowActions } from "./shared/row-actions"
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link"
import { useEffect, useState } from "react"
import { PaginatedApiResponse } from "@/shared/types/api.types"
import { TablePagination, perPageCountOptions } from "./shared/pagination"
import { IActivity, IBook, IChapter } from "@/shared/types/models.types"



type Props = {
    book?: IBook
}

export default function ActivitiesTable({ book }: Props) {
    const { toast } = useToast()
    const [tableData, setTableData] = useState<PaginatedApiResponse<IActivity[]> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(perPageCountOptions[0]);

    const loadData = async () => {
        setTableData(null)
        const res = await clientApiHandlers.activities.get({ page: currentPage, perPage: perPage })
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


    // const handleDelete = async (activity: IActivity) => {
    //     const res = await clientApiHandlers.activities.archive(activity.id)
    //     if (res.succeed) {
    //         window.location.reload()
    //     } else {
    //         toast({
    //             title: "Error",
    //             variant: "destructive",
    //             description: definedMessages.UNKNOWN_ERROR
    //         })
    //     }
    // }

    const tableColumns = columns({
        viewAction: (activity) => (
            <Link href={`/dashboard/activities/${activity.id}`}>View</Link>
        ),
        editAction: (activity) => (
            <Link href={`/dashboard/activities/${activity.id}/edit`}>Edit</Link>
        ),
        // deleteAction: handleDelete
    })


    return (
        <div>

            <BaseTable
                data={tableData?.data}
                columns={tableColumns}
                pagination={pagination}
                getFilterValue={(table) => (table.getColumn("name")?.getFilterValue() as string ?? "")}
                setFilterValue={(table, value) => {
                    table.getColumn("name")?.setFilterValue(value)
                }}
            />
        </div>

    )
}





function columns(rowActions: TableActionProps): ColumnDef<IActivity, any>[] {
    return [
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
            accessorKey: "datetime",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Date/Time" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex max-w-[100px] space-x-2">
                        <span className="max-w-[100px] truncate font-medium">
                            {(new Date(row.original.timestamp)).toLocaleString()}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: "user",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="User" />
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
            accessorKey: "description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Description" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <Link href={"#"} className="max-w-[500px] font-normal line-clamp-2">
                            {row.getValue("text")}
                        </Link>
                    </div>
                )
            }
        },
        {
            id: "actions",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Actions" />
            ),
            cell: ({ row }) => <DataTableRowActions row={row} {...rowActions} />,
        },
    ]
}
