'use client'
import { Checkbox } from "@/components/dashboard/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./shared/table"
import { DataTableRowActions } from "./shared/row-actions"
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/dashboard/ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link"
import { useEffect, useState } from "react"
import { PaginatedApiResponse } from "@/shared/types/api.types"
import { TablePagination, perPageCountOptions } from "./shared/pagination"
import { ITopic, IVerse } from "@/shared/types/models.types"


export default function VersesTable({ topic }: { topic?: ITopic }) {
    const { toast } = useToast()
    const [tableData, setTableData] = useState<PaginatedApiResponse<IVerse[]> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(perPageCountOptions[0]);

    const loadData = async () => {
        setTableData(null)
        const res = await clientApiHandlers.verses.get({
            page: currentPage, perPage: perPage,
            topic: topic?.id,
            include: { topic: { include: { chapter: { include: { book: true } } } } }
        })
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

    const handleDelete = async (verse: IVerse) => {
        const res = await clientApiHandlers.verses.archive(verse.id)
        if (res.succeed) {
            window.location.reload()
        } else {
            toast({
                title: "Error",
                variant: "destructive",
                description: definedMessages.UNKNOWN_ERROR
            })
        }
    }

    const tableColumns = columns({
        viewAction: (verse: IVerse) => (
            <Link href={`/dashboard/verses/${verse.id}`}>View</Link>
        ),
        editAction: (verse: IVerse) => (
            <Link href={`/dashboard/verses/${verse.id}/edit`}>Edit</Link>
        ),
        deleteAction: handleDelete
    })


    return (
        <div>
            <BaseTable
                data={tableData?.data}
                pagination={pagination}
                columns={tableColumns}
                getFilterValue={(table) => (table.getColumn("number")?.getFilterValue() as string ?? "")}
                setFilterValue={(table, value) => table.getColumn("number")?.setFilterValue(value)}
            />
        </div>
    )
}





function columns(rowActions: TableActionProps): ColumnDef<IVerse, any>[] {
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
            accessorKey: "number",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }) => {
                const chapter = row.original.topic?.chapter
                return (
                    <div className="flex max-w-[100px] space-x-2">
                        <span className="max-w-[100px] truncate font-medium">
                            {`${chapter?.book?.abbreviation} ${chapter?.name}:${row.original?.number}`}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: "text",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Text" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <span className="max-w-[600px] font-normal line-clamp-2">
                            {row.getValue("text")}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: "topic",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Topic" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <span className="max-w-[200px] truncate font-normal">
                            {row.original.topic?.name}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: "chapter",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Chapter" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <Link href={`/dashboard/chapters/${row.original.topic?.chapter?.id}`}
                            className="max-w-[100px] text-blue-500 truncate font-normal">
                            {`${row.original.topic?.chapter?.book?.name}/${row.original.topic?.chapter?.name}`}
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
