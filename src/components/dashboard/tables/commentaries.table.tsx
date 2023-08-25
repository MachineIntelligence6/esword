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
import { PaginatedApiResponse } from "@/shared/types/api.types"
import { useEffect, useState } from "react"
import { TablePagination, perPageCountOptions } from "./shared/pagination"
import { IAuthor, ICommentary, IVerse } from "@/shared/types/models.types"
import { useRouter } from "next/navigation"



type Props = {
    author?: IAuthor;
    verse?: IVerse;
    archivedOnly?: boolean;
}

export default function CommentariesTable({ author, verse, archivedOnly }: Props) {
    const router = useRouter()
    const { toast } = useToast()
    const [tableData, setTableData] = useState<PaginatedApiResponse<ICommentary[]> | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(perPageCountOptions[0]);

    const loadData = async () => {
        setTableData(null)
        const res = await clientApiHandlers.commentaries.get({
            page: currentPage, perPage: perPage,
            include: { author: true, verse: { include: { topic: { include: { chapter: { include: { book: true } } } } } } },
            author: author?.id,
            verse: verse?.id,
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


    const handleDelete = async (commentary: ICommentary) => {
        const res = await clientApiHandlers.commentaries.archive(commentary.id)
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

    const handlePermanentDelete = async (commmentaries: ICommentary[]) => {
        const res = await clientApiHandlers.archives.deletePermanantly({
            ids: commmentaries.map((b) => b.id),
            model: "Commentary"
        })
        if (res.succeed) {
            toast({
                title: "Commentaries(s) deleted successfully.",
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

    const handleRestore = async (commmentaries: ICommentary[]) => {
        const res = await clientApiHandlers.archives.restore({
            ids: commmentaries.map((b) => b.id),
            model: "Commentary"
        })
        if (res.succeed) {
            toast({
                title: "Commentaries restored successfully.",
            })
            // window.location.reload()
            router.push("/dashboard/commentaries")
        } else {
            toast({
                title: "Error",
                variant: "destructive",
                description: definedMessages.UNKNOWN_ERROR
            })
        }
    }


    const tableActionProps: TableActionProps = {
        viewAction: (commentary: ICommentary) => (
            <Link href={`/dashboard/commentaries/${commentary.id}`}>View</Link>
        ),
        editAction: (commentary: ICommentary) => (
            <Link href={`/dashboard/commentaries/${commentary.id}/edit`}>Edit</Link>
        ),
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
                pagination={pagination}
                columns={columns(tableActionProps)}
                toolbarActions={tableActionProps}
                getFilterValue={(table) => (table.getColumn("name")?.getFilterValue() as string ?? "")}
                setFilterValue={(table, value) => table.getColumn("name")?.setFilterValue(value)}
            />
        </div>
    )
}





function columns(rowActions: TableActionProps): ColumnDef<ICommentary, any>[] {
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
            accessorKey: "text",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Text" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <span className="max-w-[500px] font-normal line-clamp-2">
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
                        <Link href={`/dashboard/authors/${row.original.author?.id}`}
                            className="max-w-[100px] text-primary truncate font-normal">
                            {row.original.author?.name}
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
