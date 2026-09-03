'use client'
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./shared/table"
import { DataTableRowActions } from "./shared/row-actions"
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import Link from "next/link"
import { useCallback } from "react"
import { IBlog, IUser } from "@/shared/types/models.types"
import { TableCellLink, TableCellText } from "./shared/table-cell"
import { formatTableDate } from "./shared/format"
import { useInfiniteList } from "./shared/use-infinite-list"
import { Badge } from "@/components/ui/badge"

type Props = {
    user?: IUser
    archivedOnly?: boolean;
    hideSearch?: boolean;
    editAction?: TableActionProps["editAction"];
}

export default function BlogsTable({ user, archivedOnly, hideSearch = false, editAction }: Props) {
    const fetcher = useCallback(
        (page: number, pageSize: number) =>
            clientApiHandlers.blogs.get({
                page,
                perPage: pageSize,
                include: { user: true },
                user: user?.id,
                ...(archivedOnly && {
                    where: {
                        archived: true
                    }
                })
            }),
        [user?.id, archivedOnly]
    );

    const { data, hasMore, loadMore, loadingMore } = useInfiniteList<IBlog>({
        fetcher,
        deps: [user?.id, archivedOnly],
    });

    const tableActionProps: TableActionProps = {
        viewAction: (blog) => (
            <Link href={`/dashboard/blogs/${blog.id}`}>View</Link>
        ),
        editAction:
            editAction ??
            ((blog) => (
                <Link href={`/dashboard/blogs/${blog.id}/edit`}>Edit</Link>
            )),
        archiveAction: true,
        deleteAction: true,
        restoreAction: archivedOnly,
        modelName: "Blog"
    }

    return (
        <BaseTable
            data={data}
            columns={columns(tableActionProps)}
            toolbarActions={tableActionProps}
            hideSearch={hideSearch}
            embedded={!!archivedOnly}
            infiniteScroll={{
                hasMore,
                onLoadMore: loadMore,
                loadingMore,
            }}
        />
    )
}

function TagChips({ tags }: { tags?: string | null }) {
    const parts = (tags ?? "")
        .split(/[,|]/)
        .map((t) => t.trim())
        .filter(Boolean)
    if (parts.length === 0) {
        return <span className="text-sm text-slate-500">—</span>
    }
    const visible = parts.slice(0, 2)
    const rest = parts.length - visible.length
    return (
        <div className="flex max-w-[12rem] flex-wrap items-center gap-1">
            {visible.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
            {rest > 0 && (
                <Badge variant="outline" title={parts.slice(2).join(", ")}>
                    +{rest}
                </Badge>
            )}
        </div>
    )
}

function columns(rowActions: TableActionProps): ColumnDef<IBlog, any>[] {
    return [
        {
            accessorKey: "title",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Title" />
            ),
            cell: ({ row }) => (
                <TableCellLink
                    href={`/dashboard/blogs/${row.original.id}`}
                    variant="primary"
                    clamp={2}
                    className="text-slate-950 hover:text-primary"
                >
                    {row.original.title}
                </TableCellLink>
            ),
        },
        {
            accessorKey: "type",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Type" />
            ),
            cell: ({ row }) => (
                <Badge variant="outline">
                    {String(row.original.type).replace(/_/g, " ").toLowerCase()}
                </Badge>
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <Badge variant={status === "PUBLISHED" ? "success" : "secondary"}>
                        {String(status).toLowerCase()}
                    </Badge>
                )
            },
        },
        {
            id: "tags",
            accessorFn: (blog) => blog.tags ?? "",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Tags" />
            ),
            cell: ({ row }) => <TagChips tags={row.original.tags} />,
        },
        {
            id: "user",
            accessorFn: (blog) => blog.user?.name,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Author" />
            ),
            cell: ({ row }) => {
                const archived = row.original.user?.archived ?? true
                return (
                    <TableCellLink
                        href={`/dashboard/users/${row.original.userId}`}
                        disabled={archived}
                        variant="secondary"
                    >
                        {row.original.user?.name}
                    </TableCellLink>
                )
            },
        },
        {
            id: "createdAt",
            accessorFn: (blog) => formatTableDate(blog.createdAt),
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Created" />
            ),
            cell: ({ row }) => (
                <TableCellText variant="compact" className="font-normal text-slate-600">
                    {formatTableDate(row.original.createdAt)}
                </TableCellText>
            ),
        },
        {
            id: "actions",
            enableSorting: false,
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => <DataTableRowActions row={row} {...rowActions} />,
        },
    ]
}
