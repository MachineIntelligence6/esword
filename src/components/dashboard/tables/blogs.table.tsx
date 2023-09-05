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
import { IBlog, IUser } from "@/shared/types/models.types"
import { useRouter } from "next/navigation"
import { extractTextFromHtml } from "@/lib/utils"



type Props = {
    user?: IUser
    archivedOnly?: boolean;
}

export default function BlogsTable({ user, archivedOnly }: Props) {
    const router = useRouter()
    const { toast } = useToast()
    const [tableData, setTableData] = useState<PaginatedApiResponse<IBlog[]> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(perPageCountOptions[0]);

    const loadData = async () => {
        setTableData(null)
        const res = await clientApiHandlers.blogs.get({
            page: currentPage, perPage: perPage,
            include: { user: true },
            user: user?.id,
            ...(archivedOnly && {
                where: {
                    archived: true
                }
            })
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


    const handleDelete = async (blog: IBlog) => {
        const res = await clientApiHandlers.blogs.archive(blog.id)
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

    const handlePermanentDelete = async (blogs: IBlog[]) => {
        const res = await clientApiHandlers.archives.deletePermanantly({
            ids: blogs.map((b) => b.id),
            model: "Blog"
        })
        if (res.succeed) {
            toast({
                title: "Blog(s) deleted successfully.",
            })
            window.location.reload()
        } else {
            toast({
                title: "Error",
                variant: "destructive",
                description: definedMessages.UNKNOWN_ERROR
            })
        }
    }

    const handleRestore = async (blogs: IBlog[]) => {
        const res = await clientApiHandlers.archives.restore({
            ids: blogs.map((b) => b.id),
            model: "Blog"
        })
        if (res.succeed) {
            toast({
                title: "Blog(s) restored successfully.",
            })
            // window.location.reload()
            router.push("/dashboard/blogs")
        } else {
            toast({
                title: "Error",
                variant: "destructive",
                description: definedMessages.UNKNOWN_ERROR
            })
        }
    }


    const tableActionProps: TableActionProps = {
        viewAction: (blog) => (
            <Link href={`/dashboard/blogs/${blog.id}`}>View</Link>
        ),
        editAction: (blog) => (
            <Link href={`/dashboard/blogs/${blog.id}/edit`}>Edit</Link>
        ),
        deleteMessage: "This action will delete delete the selected blog.",
        archiveAction: handleDelete,
        ...(archivedOnly && {
            restoreAction: handleRestore,
            deleteAction: handlePermanentDelete,
        }),
    }



    return (
        <div>
            <BaseTable
                data={tableData?.data}
                columns={columns(tableActionProps)}
                pagination={pagination}
                toolbarActions={tableActionProps}
                getFilterValue={(table) => (table.getColumn("title")?.getFilterValue() as string ?? "")}
                setFilterValue={(table, value) => {
                    table.getColumn("title")?.setFilterValue(value)
                }}
            />
        </div>
    )
}





function columns(rowActions: TableActionProps): ColumnDef<IBlog, any>[] {
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
            accessorKey: "title",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Title" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex max-w-[100px] space-x-2">
                        <span className="max-w-[100px] truncate font-medium">
                            {row.original.title}
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
                            {row.original.slug}
                        </Link>
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
                    <div className="flex max-w-[100px] space-x-2">
                        <span className="max-w-[100px] truncate font-medium">
                            {row.original.type}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: "content",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Content" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex w-full space-x-2">
                        <span className="w-max max-w-[500px] truncate font-medium">
                            {extractTextFromHtml(row.original.content)}
                        </span>
                    </div>
                )
            },
        },
        // {
        //     accessorKey: "tags",
        //     header: ({ column }) => (
        //         <DataTableColumnHeader column={column} title="Tags" />
        //     ),
        //     cell: ({ row }) => {
        //         return (
        //             <div className="flex max-w-[100px] space-x-2">
        //                 <span className="max-w-[100px] truncate font-medium">
        //                     {row.original.tags}
        //                 </span>
        //             </div>
        //         )
        //     },
        // },
        {
            accessorKey: "user",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="User" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex max-w-[100px] space-x-2">
                        <span className="max-w-[100px] truncate font-medium">
                            {row.original.user?.name}
                        </span>
                    </div>
                )
            },
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
