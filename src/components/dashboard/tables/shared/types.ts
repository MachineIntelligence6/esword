import { ReactNode } from "react";


export type TableActionProps = {
    viewAction?: (row: any) => ReactNode;
    editAction?: (row: any) => ReactNode;
    deleteAction?: (row: any) => Promise<void>;
    deleteMessage?: string
}