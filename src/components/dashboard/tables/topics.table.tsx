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
import { useToast } from "@/components/ui/use-toast"
import definedMessages from "@/shared/constants/messages"
import { useRouter } from "next/navigation"


type Props = TableActionProps & {
    chapter?: IChapter;
    archivedOnly?: boolean;
}

export default function TopicsTable({ chapter, archivedOnly, ...props }: Props) {
    const router = useRouter()
    const [tableData, setTableData] = useState<PaginatedApiResponse<ITopic[]> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(perPageCountOptions[0]);

    const { toast } = useToast();

    const handleDelete = async (topic: ITopic) => {
        const res = await clientApiHandlers.topics.archive(topic.id)
        if (res.succeed) {
            window.location.reload()
        } else if (res.code === "DATA_LINKED") {
            toast({
                title: "Topic can not be deleted.",
                variant: "destructive",
                description: "All verses linked with this topic must be unlinked in order to delete this topic."
            })
        } else {
            toast({
                title: "Error",
                variant: "destructive",
                description: definedMessages.UNKNOWN_ERROR
            })
        }
    }

    const handleRestore = async (topics: ITopic[]) => {
        const res = await clientApiHandlers.archives.restore({
            ids: topics.map((b) => b.id),
            model: "Topic"
        })
        if (res.succeed) {
            toast({
                title: "Topic(s) restored successfully.",
            })
            // window.location.reload()
            router.push("/dashboard/topics")
        } else {
            toast({
                title: "Error",
                variant: "destructive",
                description: definedMessages.UNKNOWN_ERROR
            })
        }
    }


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

    return (
        <BaseTable
            data={tableData?.data}
            columns={columns({
                ...props,
                viewAction: (topic: ITopic) => (
                    <Link href={`/dashboard/topics/${topic.id}`}>View</Link>
                ),
                restoreAction: handleRestore,
                deleteAction: handleDelete
            })}
            pagination={pagination}
            {...(archivedOnly && {
                ...{
                    toolbarActions: {
                        restore: handleRestore
                    }
                }
            })}
            getFilterValue={(table) => (table.getColumn("name")?.getFilterValue() as string ?? "")}
            setFilterValue={(table, value) => {
                table.getColumn("name")?.setFilterValue(value)
            }} />
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
            accessorKey: "chapter",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Chapter" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <Link href={`/dashboard/chapters/${row.original.chapterId}`} className="max-w-[100px] text-primary truncate font-normal">
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
