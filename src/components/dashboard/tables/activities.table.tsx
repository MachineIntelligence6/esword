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
import definedMessages from "@/shared/constants/messages"
import { Session } from "next-auth"
import { useSession } from "next-auth/react"



type Props = {
    book?: IBook;
    archivedOnly?: boolean;
}

export default function ActivitiesTable({ archivedOnly }: Props) {
    const { data: session } = useSession();
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


    const tableColumns = columns({
        archiveAction: true,
        deleteAction: true,
        restoreAction: archivedOnly,
        modelName: "Activity"
    }, session)


    return (
        <div>
            <BaseTable
                data={tableData?.data}
                columns={tableColumns}
                pagination={pagination}
            />
        </div>

    )
}




function generateActivityRefUrl(activity: IActivity) {
    if (activity.action === "ARCHIVE") {
        return `/dashboard/archives`
    }
    if (activity.action === "RESTORE" || !activity.ref) {
        return `/dashboard/${activity.model.toLowerCase()}`
    }
    if (activity.action === "CREATE" || activity.action === "UPDATE") {
        return `/dashboard/${activity.model.toLowerCase()}/${activity.ref ?? ""}`
    }
    return '#'
}


function columns(rowActions: TableActionProps, session: Session | null): ColumnDef<IActivity, any>[] {
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
            id: "datetime",
            accessorFn: (activity) => (new Date(activity.timestamp)).toLocaleString(),
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Date/Time" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        <span className="max-w-[200px] truncate font-medium">
                            {(new Date(row.original.timestamp)).toLocaleString()}
                        </span>
                    </div>
                )
            },
        },
        {
            id: "user",
            accessorFn: (activity) => activity.user?.name,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="User" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex max-w-[100px] space-x-2">
                        <Link
                            href={`/dashboard/users/${row.original.userId}`}
                            className="max-w-[100px] text-primary truncate font-medium">
                            {row.original.user?.name}
                        </Link>
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
                        <Link
                            href={generateActivityRefUrl(row.original)}
                            className="max-w-[500px] text-primary font-normal line-clamp-2">
                            {row.getValue("description")}
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
