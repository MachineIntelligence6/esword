import Spinner from "@/components/spinner";
import {
    AlertDialog, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TableActionProps } from "../shared/types"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { useSession } from "next-auth/react";



interface DataTableRowActionsProps<TData> extends TableActionProps {
    row: Row<TData>
}


export function DataTableRowActions<TData>({
    row,
    editAction,
    viewAction,
    archiveAction,
    deleteMessage,
    restoreAction,
}: DataTableRowActionsProps<TData>) {
    const { data: session } = useSession()
    const [alertOpen, setAlertOpen] = useState(false);
    const archived = (row.original as any).archived
    const deleteEnabled = session?.user && session.user.role === "ADMIN" && archiveAction

    const deletePopupProps: TableActionPopupProps = {
        title: "Are you sure to delete?",
        description: deleteMessage ?? "This action will delete the current row and all data linked with it.",
        actionBtn: { text: "Delete", variant: "destructive" },
        open: alertOpen, setOpen: setAlertOpen,
        action: async () => await archiveAction?.(row.original)
    }
    const restorePopupProps: TableActionPopupProps = {
        title: "Are you sure to restore?",
        description: deleteMessage ?? "This action will restore the current row and all data linked with it.",
        actionBtn: { text: "Restore", variant: "default" },
        open: alertOpen, setOpen: setAlertOpen,
        action: async () => await restoreAction?.([row.original])
    }

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                        <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    {
                        viewAction &&
                        <DropdownMenuItem asChild>
                            {viewAction(row.original)}
                        </DropdownMenuItem>
                    }
                    {
                        editAction &&
                        <DropdownMenuItem asChild>
                            {editAction(row.original)}
                        </DropdownMenuItem>
                    }
                    {
                        ((editAction || viewAction) && deleteEnabled) &&
                        <DropdownMenuSeparator />
                    }
                    {
                        archived ?
                            restoreAction &&
                            <DropdownMenuItem onClick={() => setAlertOpen(true)}>
                                Restore
                            </DropdownMenuItem>
                            :
                            (deleteEnabled) &&
                            <DropdownMenuItem onClick={() => setAlertOpen(true)}>
                                Delete
                            </DropdownMenuItem>
                    }
                </DropdownMenuContent>
            </DropdownMenu>
            {
                <TableActionPopup {...(archived ? { ...restorePopupProps } : { ...deletePopupProps })} />
            }
        </div>
    )
}




export type TableActionPopupProps = {
    open: boolean;
    setOpen: (value: boolean) => void;
    action?: () => Promise<void>;
    title: string;
    description: string;
    actionBtn: {
        variant?: "link" | "default" | "primary" | "destructive" | "outline" | "secondary" | "ghost",
        text: string
    }
}

export function TableActionPopup({
    open, setOpen, action,
    title, description, actionBtn
}: TableActionPopupProps) {
    const [processing, setProcessing] = useState(false);

    const handleDoAction = async () => {
        setProcessing(true);
        await action?.()
        setProcessing(false);
        setOpen(false);
    }
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
                    <Button variant={actionBtn.variant} onClick={handleDoAction}>
                        {
                            processing ?
                                <Spinner className="border-white" />
                                :
                                <span>{actionBtn.text}</span>
                        }
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}





export function DeleteBatchRowsAction({ onDelete }: { onDelete?: () => Promise<void> }) {
    const [processing, setProcessing] = useState(false);
    const [open, setOpen] = useState(false)

    const handleDelete = async () => {
        setProcessing(true);
        await onDelete?.()
        setProcessing(false);
        setOpen(false)
    }
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger>
                <Button variant="destructive">
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will delete all selected rows.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant={"destructive"} onClick={handleDelete}>
                        {
                            processing ?
                                <Spinner className="border-white" />
                                :
                                <span>Delete</span>
                        }
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
