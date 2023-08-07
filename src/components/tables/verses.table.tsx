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
import { Chapter, Verse } from "@prisma/client"
import Link from "next/link"


type Props = {
    verses: Verse[]
}

export default function VersesTable({ verses, ...props }: Props) {
    const { toast } = useToast()

    const handleDelete = async (verse: Verse) => {
        const res = await apiClientActions.verses.archive(verse.id)
        if (res.succeed) {
            toast({
                title: "Verse Deleted",
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
        viewAction: (verse: Verse) => (
            <Link href={`/dashboard/verses/${verse.id}`}>View</Link>
        ),
        editAction: (verse: Verse) => (
            <Link href={`/dashboard/verses/${verse.id}/edit`}>Edit</Link>
        ),
        deleteAction: handleDelete
    })


    return (
        <div>
            <BaseTable
                data={verses}
                columns={tableColumns}
                getFilterValue={(table) => (table.getColumn("name")?.getFilterValue() as string ?? "")}
                setFilterValue={(table, value) => table.getColumn("name")?.setFilterValue(value)}
            />
        </div>
    )
}





function columns(rowActions: TableActionProps): ColumnDef<Verse, any>[] {
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
                        <span className="max-w-[200px] truncate font-normal line-clamp-2">
                            {row.getValue("text")}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: "type",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Type" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <span className="max-w-[100px] truncate font-normal">
                            {row.getValue("type")}
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
                        <a
                            href={`/dashboard/chapters/${(row.original as any).chapter?.id}`}
                            className="max-w-[100px] text-blue-500 truncate font-normal">
                            {(row.original as any).chapter?.name}
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
