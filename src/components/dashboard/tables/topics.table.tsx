'use client'
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./shared/table"
import { DataTableRowActions } from "./shared/row-actions"
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import { TablePagination, perPageCountOptions } from "./shared/pagination"
import { useEffect, useState } from "react"
import { PaginatedApiResponse } from "@/shared/types/api.types"
import clientApiHandlers from "@/client/handlers"
import { IChapter, ITopic } from "@/shared/types/models.types"
import Link from "next/link"
import { cn } from "@/lib/utils"


type Props = Omit<TableActionProps, "modelName"> & {
    chapter?: IChapter;
    archivedOnly?: boolean;
}

export default function TopicsTable({ chapter, archivedOnly, ...props }: Props) {
    const [tableData, setTableData] = useState<PaginatedApiResponse<ITopic[]> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(perPageCountOptions[0]);



    const loadData = async () => {
        setTableData(null)
        const res = await clientApiHandlers.topics.get({
            page: currentPage, perPage: perPage,
            chapter: chapter?.id,
            include: { chapter: { include: { book: true } } },
            ...(archivedOnly && { where: { archived: true } })
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


    const tableActionProps: TableActionProps = {
        ...props,
        viewAction: (topic: ITopic) => (
            <Link href={`/dashboard/topics/${topic.id}`}>View</Link>
        ),
        archiveAction: true,
        deleteAction: true,
        restoreAction: archivedOnly,
        modelName: "Topic"
    }

    return (
        <BaseTable
            data={tableData?.data}
            columns={columns(tableActionProps)}
            pagination={pagination}
            toolbarActions={tableActionProps}
        />
    )
}




function columns(rowActions: TableActionProps): ColumnDef<ITopic, any>[] {
    const tableCols: ColumnDef<ITopic, any>[] = [
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
            accessorKey: "number",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Number" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <span className="max-w-[100px] truncate font-normal">
                            {row.getValue("number")}
                        </span>
                    </div>
                )
            }
        },
        {
            id: "chapter",
            accessorFn: (topic) => `${topic.chapter?.book?.name} / ${topic.chapter?.name}`,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Chapter" />
            ),
            cell: ({ row }) => {
                const archived = row.original.chapter?.archived ?? true
                return (
                    <div className="flex items-center">
                        <Link
                            href={archived ? "#" : `/dashboard/chapters/${row.original.chapterId}`}
                            className={cn(
                                "max-w-[100px] truncate font-medium",
                                archived ? "text-gray-700" : "text-primary"
                            )}>
                            {`${row.original.chapter?.book?.name} / ${row.original.chapter?.name}`}
                        </Link>
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
