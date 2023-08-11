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
import { Author, Commentary, Verse } from "@prisma/client"
import Link from "next/link"
import { PaginatedApiResponse } from "@/shared/types/api.types"
import { useEffect, useState } from "react"
import { TablePagination, perPageCountOptions } from "./shared/pagination"



type Props = {
    author?: Author;
    verse?: Verse
}

export default function CommentariesTable({ author, verse }: Props) {
    const { toast } = useToast()
    const [tableData, setTableData] = useState<PaginatedApiResponse<Commentary[]> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(perPageCountOptions[0]);

    const loadData = async () => {
        setTableData(null)
        const res = await clientApiHandlers.commentaries.get({
            page: currentPage, perPage: perPage,
            include: { author: true, verse: true },
            author: author?.id,
            verse: verse?.id
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


    const handleDelete = async (commentary: Commentary) => {
        const res = await clientApiHandlers.commentaries.archive(commentary.id)
        if (res.succeed) {
            toast({
                title: "Commentary Deleted",
                description: definedMessages.VERSE_DELETED
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
        viewAction: (commentary: Commentary) => (
            <Link href={`/dashboard/commentaries/${commentary.id}`}>View</Link>
        ),
        editAction: (commentary: Commentary) => (
            <Link href={`/dashboard/commentaries/${commentary.id}/edit`}>Edit</Link>
        ),
        deleteAction: handleDelete
    })


    return (
        <div>
            <BaseTable
                data={tableData?.data}
                pagination={pagination}
                columns={tableColumns}
                getFilterValue={(table) => (table.getColumn("name")?.getFilterValue() as string ?? "")}
                setFilterValue={(table, value) => table.getColumn("name")?.setFilterValue(value)}
            />
        </div>
    )
}





function columns(rowActions: TableActionProps): ColumnDef<Commentary, any>[] {
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
        {
            id: "index",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="#" />
            ),
            cell: ({ row }) => <div className="w-[30px]">{row.index + 1}</div>,
            enableSorting: false,
            enableHiding: false,
        },
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
            accessorKey: "text",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Text" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <span className="max-w-[250px] font-normal line-clamp-2">
                            {row.getValue("text")}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: "author",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Author" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <a
                            href={`/dashboard/authors/${(row.original as any).author?.id}`}
                            className="max-w-[100px] text-blue-500 truncate font-normal">
                            {(row.original as any).author?.name}
                        </a>
                    </div>
                )
            }
        },
        {
            accessorKey: "verse",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Verse" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <a
                            href={`/dashboard/verses/${(row.original as any).verse?.id}`}
                            className="max-w-[100px] text-blue-500 truncate font-normal">
                            {(row.original as any).verse?.name}
                        </a>
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
