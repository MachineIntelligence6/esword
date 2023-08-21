'use client'
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./shared/table"
import { DataTableRowActions } from "./shared/row-actions"
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link"
import { useEffect, useState } from "react"
import { PaginatedApiResponse } from "@/shared/types/api.types"
import { TablePagination, perPageCountOptions } from "./shared/pagination"
import { IBook, IChapter } from "@/shared/types/models.types"



type Props = {
    book?: IBook
}

export default function ChaptersTable({ book }: Props) {
    const { toast } = useToast()
    const [tableData, setTableData] = useState<PaginatedApiResponse<IChapter[]> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(perPageCountOptions[0]);

    const loadData = async () => {
        setTableData(null)
        const res = await clientApiHandlers.chapters.get({ page: currentPage, perPage: perPage, include: { book: true }, book: book?.id })
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


    const handleDelete = async (chapter: IChapter) => {
        const res = await clientApiHandlers.chapters.archive(chapter.id)
        if (res.succeed) {
            window.location.reload()
        } else if (res.code === "DATA_LINKED") {
            toast({
                title: "Chapter can not be deleted.",
                variant: "destructive",
                description: "All topics linked with this chapter must be unlinked in order to delete this chapter."
            })
        } else {
            toast({
                title: "Error",
                variant: "destructive",
                description: definedMessages.UNKNOWN_ERROR
            })
        }
    }

    const tableColumns = columns({
        viewAction: (chapter) => (
            <Link href={`/dashboard/chapters/${chapter.id}`}>View</Link>
        ),
        editAction: (chapter) => (
            <Link href={`/dashboard/chapters/${chapter.id}/edit`}>Edit</Link>
        ),
        deleteAction: handleDelete
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





function columns(rowActions: TableActionProps): ColumnDef<IChapter, any>[] {
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
                        <Link href={`/dashboard/chapters/${row.original.id}`}
                            className="max-w-[100px] text-primary truncate font-normal">
                            {row.getValue("slug")}
                        </Link>
                    </div>
                )
            }
        },
        {
            accessorKey: "commentaryName",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Commentary Name" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex max-w-[100px] space-x-2">
                        <span className="max-w-[100px] truncate font-medium">
                            {row.original.commentaryName}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: "commentaryText",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Commentary Text" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex max-w-[100px] space-x-2">
                        <span className="max-w-[100px] truncate font-medium">
                            {row.original.commentaryText}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: "book",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Book" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <Link href={`/dashboard/books/${row.original.bookId}`}
                            className="max-w-[100px] text-primary truncate font-normal">
                            {row.original.book?.name}
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
