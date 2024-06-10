"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./shared/table";
import { DataTableRowActions } from "./shared/row-actions";
import { TableActionProps } from "./shared/types";
import { BaseTable } from "./shared/table";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PaginatedApiResponse } from "@/shared/types/api.types";
import { TablePagination, perPageCountOptions } from "./shared/pagination";
import { ITopic, IVerse } from "@/shared/types/models.types";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";

export default function VersesTable({
  topic,
  archivedOnly,
}: {
  topic?: ITopic;
  archivedOnly?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [tableData, setTableData] = useState<PaginatedApiResponse<
    IVerse[]
  > | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(perPageCountOptions[0]);
  const searchQuery = useTableSearchStore((state) => state.searchQuery);
  const loadData = async () => {
    setTableData(null);
    const res = await clientApiHandlers.verses.get({
      page: currentPage,
      perPage: perPage,
      topic: topic?.id,
      include: { topic: { include: { chapter: { include: { book: true } } } } },
      where: {
        ...(searchQuery && {
          OR: [
            { text: { contains: searchQuery } },
            ...(isNaN(parseInt(searchQuery))
              ? []
              : [{ number: { equals: parseInt(searchQuery) } }]),
            { topic: { name: { contains: searchQuery } } },
            {
              topic: { chapter: { commentaryText: { contains: searchQuery } } },
            },
            {
              topic: {
                chapter: { book: { abbreviation: { contains: searchQuery } } },
              },
            },
            ...(isNaN(parseInt(searchQuery))
              ? []
              : [
                  {
                    topic: {
                      chapter: { name: { equals: parseInt(searchQuery) } },
                    },
                  } as const,
                ]),
            {
              topic: { chapter: { book: { name: { contains: searchQuery } } } },
            },
            ...(isNaN(parseInt(searchQuery))
              ? []
              : [{ topicId: { equals: parseInt(searchQuery) } }]),
            ...(isNaN(parseInt(searchQuery))
              ? []
              : [{ topic: { chapterId: { equals: parseInt(searchQuery) } } }]),
          ],
        }),
        ...(archivedOnly && { archived: true }),
      },
    });
    setTableData(res);
  };

  const debounce = (
    func: (...args: any) => void,
    delay: number | undefined
  ) => {
    let timeoutId: NodeJS.Timeout | null = null;
    return (...args: any) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedLoadData = debounce(loadData, 1000); // adjust the delay as needed

  useEffect(() => {
    debouncedLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // useEffect for currentPage and perPage without debounce
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage]);

  const pagination: TablePagination = {
    onPageChange: setCurrentPage,
    currentPage: currentPage,
    perPage: perPage,
    setPerPage: setPerPage,
    totalPages: tableData?.pagination?.totalPages ?? 1,
  };

  const tableActionProps: TableActionProps = {
    viewAction: (verse: IVerse) => (
      <Link href={`/dashboard/verses/${verse.id}`}>View</Link>
    ),
    editAction: (verse: IVerse) => (
      <Link href={`/dashboard/verses/${verse.id}/edit`}>Edit</Link>
    ),
    archiveAction: true,
    deleteAction: true,
    restoreAction: archivedOnly,
    modelName: "Verse",
  };

  return (
    <div>
      <BaseTable
        data={tableData?.data}
        pagination={pagination}
        columns={columns(tableActionProps)}
        toolbarActions={tableActionProps}
      />
    </div>
  );
}

function columns(rowActions: TableActionProps): ColumnDef<IVerse, any>[] {
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
      id: "name",
      accessorFn: (verse) => {
        const chapter = verse.topic?.chapter;
        return `${chapter?.book?.abbreviation} ${chapter?.name}:${verse.number}`;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const chapter = row.original.topic?.chapter;
        return (
          <div className="flex max-w-[100px] space-x-2">
            <span className="max-w-[100px] truncate font-medium">
              {`${chapter?.book?.abbreviation} ${chapter?.name}:${row.original?.number}`}
            </span>
          </div>
        );
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
            <span className="max-w-[600px] font-normal line-clamp-2">
              {row.getValue("text")}
            </span>
          </div>
        );
      },
    },
    {
      id: "topic",
      accessorFn: (verse) => verse.topic?.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Topic" />
      ),
      cell: ({ row }) => {
        const archived = row.original.topic?.archived ?? true;
        return (
          <div className="flex max-w-[200px]">
            <Link
              href={
                archived ? "#" : `/dashboard/topics/${row.original.topicId}`
              }
              className={cn(
                "max-w-[100px] truncate font-medium",
                archived ? "text-gray-700" : "text-primary"
              )}
            >
              {row.original.topic?.name}
            </Link>
          </div>
        );
      },
    },
    {
      id: "chapter",
      accessorFn: (verse) =>
        `${verse.topic?.chapter?.book?.name}/${verse.topic?.chapter?.name}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Chapter" />
      ),
      cell: ({ row }) => {
        const archived = row.original.topic?.chapter?.archived ?? true;
        return (
          <div className="flex items-center">
            <Link
              href={
                archived
                  ? "#"
                  : `/dashboard/chapters/${row.original.topic?.chapter?.id}`
              }
              className={cn(
                "max-w-[100px] truncate font-medium",
                archived ? "text-gray-700" : "text-primary"
              )}
            >
              {`${row.original.topic?.chapter?.book?.name}/${row.original.topic?.chapter?.name}`}
            </Link>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => <DataTableRowActions row={row} {...rowActions} />,
    },
  ];
}
