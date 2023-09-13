import { ReactNode } from "react";


export type TableActionProps = {
    viewAction?: (row: any) => ReactNode;
    editAction?: (row: any) => ReactNode;
    deleteAction?: (row: any) => Promise<void>;
    deleteOptions?: {
        confirmation?: boolean;
        message: string;
    };
    restoreAction?: (row: any) => Promise<void>;
    archiveAction?: (row: any) => Promise<void>;
    deleteMessage?: string
}
export type TableToolbarAction = {
    btn: { text: string },
    actionCallback: () => Promise<void>;
}