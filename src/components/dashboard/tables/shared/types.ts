import { Prisma } from "@prisma/client";
import { ReactNode } from "react";
import { BookExportFormat } from "@/lib/book-export";

export type TableActionProps = {
  viewAction?: (row: any) => ReactNode;
  editAction?: (row: any) => ReactNode;
  restoreAction?: boolean;
  deleteAction?: boolean;
  archiveAction?: boolean;
  exportFormats?: ReadonlyArray<{
    id: BookExportFormat;
    label: string;
  }>;
  onExport?: (row: any, format: BookExportFormat) => void | Promise<void>;
  modelName: Prisma.ModelName;
};
export type TableToolbarAction = {
  btn: { text: string };
  actionCallback: () => Promise<void>;
};
