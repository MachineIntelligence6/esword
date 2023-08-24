'use client'
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./shared/table"
import { DataTableRowActions } from "./shared/row-actions"
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers"
import { TablePagination, perPageCountOptions } from "./shared/pagination"
import { useEffect, useState } from "react"
import { PaginatedApiResponse } from "@/shared/types/api.types"
import { IUser } from "@/shared/types/models.types"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import definedMessages from "@/shared/constants/messages"
import Link from "next/link"
import { useRouter } from "next/navigation"


type Props = TableActionProps & {
    archivedOnly?: boolean;
}

export default function UsersTable({ archivedOnly, ...props }: Props) {
    const router = useRouter()
    const { data: session } = useSession()
    const [tableData, setTableData] = useState<PaginatedApiResponse<IUser[]> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(perPageCountOptions[0]);
    const { toast } = useToast()

    const loadData = async () => {
        if (!session) return;
        setTableData(null)
        const res = await clientApiHandlers.users.get({
            page: currentPage,
            perPage: perPage,
            ...(session.user.role !== "ADMIN" && { where: { role: { not: "ADMIN" } } }),
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



    const handleDelete = async (user: IUser) => {
        const res = await clientApiHandlers.users.archive(user.id)
        if (res.succeed) {
            window.location.reload();
        } else {
            toast({
                title: "Error",
                variant: "destructive",
                description: definedMessages.UNKNOWN_ERROR
            })
        }
    }

    const handleRestore = async (users: IUser[]) => {
        const res = await clientApiHandlers.archives.restore({
            ids: users.map((b) => b.id),
            model: "User"
        })
        if (res.succeed) {
            toast({
                title: "User(s) restored successfully.",
            })
            // window.location.reload()
            router.push("/dashboard/users")
        } else {
            toast({
                title: "Error",
                variant: "destructive",
                description: definedMessages.UNKNOWN_ERROR
            })
        }
    }


    return (
        <BaseTable
            data={tableData?.data}
            columns={columns({
                ...props,
                viewAction: (user: IUser) => (
                    <Link href={`/dashboard/users/${user.id}`}>View</Link>
                ),
                deleteAction: handleDelete,
                deleteMessage: "This action will delete the user account and all data (notes) linked with it."
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




function columns(rowActions: TableActionProps): ColumnDef<IUser, any>[] {
    const tableCols: ColumnDef<IUser, any>[] = [
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
            accessorKey: "email",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Email" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <span className="max-w-[300px] line-clamp-3 font-medium">
                            {row.getValue("email")}
                        </span>
                    </div>
                )
            }
        },
        {
            accessorKey: "role",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Role" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <span className="max-w-[300px] line-clamp-3 font-medium">
                            {row.getValue("role")}
                        </span>
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
