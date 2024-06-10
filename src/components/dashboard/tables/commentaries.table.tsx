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
import { PaginatedApiResponse } from "@/shared/types/api.types";
import { useEffect, useState } from "react";
import { TablePagination, perPageCountOptions } from "./shared/pagination";
import { IAuthor, ICommentary, IVerse } from "@/shared/types/models.types";
import { useRouter } from "next/navigation";
import { cn, extractTextFromHtml } from "@/lib/utils";
import { useTableSearchStore } from "@/lib/zustand/tableSearch";

type Props = {
  author?: IAuthor;
  verse?: IVerse;
  archivedOnly?: boolean;
};

export default function CommentariesTable({
  author,
  verse,
  archivedOnly,
}: Props) {
  const [tableData, setTableData] = useState<PaginatedApiResponse<
    ICommentary[]
  > | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(perPageCountOptions[0]);
  const searchQuery = useTableSearchStore((state) => state.searchQuery);

  const loadData = async () => {
    setTableData(null);
    const res = await clientApiHandlers.commentaries.get({
      page: currentPage,
      perPage: perPage,
      include: {
        author: true,
        verse: {
          include: {
            topic: { include: { chapter: { include: { book: true } } } },
          },
        },
      },
      author: author?.id,
      verse: verse?.id,
      //   ...(archivedOnly && { where: { archived: true } }),
      where: {
        OR: [
          { name: { contains: searchQuery } },
          { text: { contains: searchQuery } },
          { author: { name: { contains: searchQuery } } },
          ...(isNaN(parseInt(searchQuery))
            ? []
            : [{ verse: { number: { equals: parseInt(searchQuery) } } }]),
          { verse: { topic: { name: { contains: searchQuery } } } },
          {
            verse: {
              topic: {
                chapter: { book: { abbreviation: { contains: searchQuery } } },
              },
            },
          },
        ],
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
    viewAction: (commentary: ICommentary) => (
      <Link href={`/dashboard/commentaries/${commentary.id}`}>View</Link>
    ),
    editAction: (commentary: ICommentary) => (
      <Link href={`/dashboard/commentaries/${commentary.id}/edit`}>Edit</Link>
    ),
    archiveAction: true,
    deleteAction: true,
    restoreAction: archivedOnly,
    modelName: "Commentary",
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
        );
      },
    },
    {
      id: "text",
      accessorFn: (commentary) => extractTextFromHtml(commentary.text),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Text" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span className="max-w-[500px] font-normal line-clamp-2">
              {extractTextFromHtml(row.getValue("text"))}
            </span>
          </div>
        );
      },
    },
    {
      id: "author",
      accessorFn: (commentary) => commentary.author?.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Author" />
      ),
      cell: ({ row }) => {
        const archived = row.original.author?.archived ?? true;
        return (
          <div className="flex items-center">
            <Link
              href={
                archived ? "#" : `/dashboard/authors/${row.original.author?.id}`
              }
              className={cn(
                "max-w-[100px] truncate font-medium",
                archived ? "text-gray-700" : "text-primary"
              )}
            >
              {row.original.author?.name}
            </Link>
          </div>
        );
      },
    },
    {
      id: "verse",
      accessorFn: (commentary) => {
        const chapter = commentary.verse?.topic?.chapter;
        return `${chapter?.book?.abbreviation} ${chapter?.name}:${commentary.verse?.number}`;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Verse" />
      ),
      cell: ({ row }) => {
        const archived = row.original.verse?.archived ?? true;
        const chapter = row.original.verse?.topic?.chapter;
        return (
          <div className="flex items-center">
            <Link
              href={
                archived ? "#" : `/dashboard/verses/${row.original.verseId}`
              }
              className={cn(
                "max-w-[100px] truncate font-medium",
                archived ? "text-gray-700" : "text-primary"
              )}
            >
              {`${chapter?.book?.abbreviation} ${chapter?.name}:${row.original.verse?.number}`}
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
