'use client'
import { Checkbox } from "@/components/ui/checkbox"
import { labels } from "@/data/data"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./shared/table"
import { DataTableRowActions } from "./shared/row-actions"
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import apiClientActions from "@/client/actions";
import { useToast } from "@/components/ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import { ChapterWBook } from "@/shared/types/models.types";
import { Chapter } from "@prisma/client"
import Link from "next/link"


type Props = {
    chapters: ChapterWBook[]
}

export default function ChaptersTable({ chapters, ...props }: Props) {
    const { toast } = useToast()

    const handleDelete = async (chapter: Chapter) => {
        const res = await apiClientActions.chapters.archive(chapter.id)
        if (res.succeed) {
            toast({
                title: "Chapter Deleted",
                description: definedMessages.CHAPTER_DELETED
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
                data={chapters}
                columns={tableColumns}
                getFilterValue={(table) => (table.getColumn("name")?.getFilterValue() as string ?? "")}
                setFilterValue={(table, value) => {
                    table.getColumn("name")?.setFilterValue(value)
                }}
            />
        </div>

    )
}





function columns(rowActions: TableActionProps): ColumnDef<ChapterWBook, any>[] {
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
            accessorKey: "slug",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Slug" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <a
                            href={`/dashboard/chapters/${row.original.id}`}
                            className="max-w-[100px] text-blue-500 truncate font-normal">
                            {row.getValue("slug")}
                        </a>
                    </div>
                )
            }
        },
        {
            accessorKey: "book",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Book" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <a
                            href={`/dashboard/books/${row.original.book?.id}`}
                            className="max-w-[100px] text-blue-500 truncate font-normal">
                            {row.original.book?.name}
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
