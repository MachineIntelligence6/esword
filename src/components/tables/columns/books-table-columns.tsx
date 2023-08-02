"use client"

import { labels, statuses } from "@/data/data"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { DataTableRowActions } from "@/components/tables/data-table-row-actions"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Book } from "@prisma/client"

export const columns: ColumnDef<Book>[] = [
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
      const label = labels.find((label) => label.value === row.original.name)

      return (
        <div className="flex max-w-[100px] space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate font-medium">
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
      const label = labels.find((label) => label.value === row.original.slug)
      return (
        <div className="flex items-center">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <a href={"/dashboard/books/" + row.getValue("slug")} className="max-w-[500px] text-blue-500 truncate font-normal">
            {"/books/" + row.getValue("slug")}
          </a>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]