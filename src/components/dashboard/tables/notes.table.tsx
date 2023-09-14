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
import { useEffect, useState } from "react"
import { PaginatedApiResponse } from "@/shared/types/api.types"
import { TablePagination, perPageCountOptions } from "./shared/pagination"
import { INote, IUser, IVerse } from "@/shared/types/models.types"
import Link from "next/link"
import { extractTextFromHtml } from "@/lib/utils"
import { useRouter } from "next/navigation"



type Props = {
    user?: IUser;
    verse?: IVerse;
}


export default function NotesTable({ user, verse }: Props) {
    const { toast } = useToast()
    const [tableData, setTableData] = useState<PaginatedApiResponse<INote[]> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(perPageCountOptions[0]);

    const loadData = async () => {
        setTableData(null)
        const res = await clientApiHandlers.notes.get({
            page: currentPage, perPage: perPage,
            include: {
                user: true,
                verse: {
                    include: {
                        topic: {
                            include: {
                                chapter: {
                                    include: { book: true }
                                }
                            }
                        }
                    }
                }
            },
            user: user?.id,
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


    const tableColumns = columns({
        viewAction: (note: INote) => (
            <Link href={`/dashboard/notes/${note.id}`}>View</Link>
        ),
        editAction: (note: INote) => (
            <Link href={`/dashboard/notes/${note.id}/edit`}>Edit</Link>
        ),
        // archiveAction: true,
        // deleteAction: true,
        // restoreAction: archivedOnly,
        modelName: "Note"
    })


    return (
        <div>
            <BaseTable
                data={tableData?.data}
                pagination={pagination}
                columns={tableColumns}
            />
        </div>
    )
}





function columns(rowActions: TableActionProps): ColumnDef<INote, any>[] {
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
            accessorKey: "text",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Text" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <span className="max-w-[500px] line-clamp-1 font-medium">
                            {extractTextFromHtml(row.original.text)}
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
                    <div className="flex items-center">
                        <Link href={`/dashboard/users/${row.original.userId}`}
                            className="max-w-[100px] text-primary truncate font-normal">
                            {row.original.user?.name}
                        </Link>
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
                const chapter = row.original.verse?.topic?.chapter
                return (
                    <div className="flex items-center">
                        <Link href={`/dashboard/verses/${row.original.verseId}`}
                            className="max-w-[100px] text-primary truncate font-normal">
                            {`${chapter?.book?.abbreviation} ${chapter?.name}:${row.original.verse?.number}`}
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
