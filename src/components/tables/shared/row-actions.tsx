import Spinner from "@/components/spinner";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TableActionProps } from "../shared/types"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"



interface DataTableRowActionsProps<TData> extends TableActionProps {
    row: Row<TData>
}


export function DataTableRowActions<TData>({
    row,
    editAction,
    viewAction,
    deleteAction
}: DataTableRowActionsProps<TData>) {
    const [delAlertOpen, setDelAlertOpen] = useState(false);
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
                        (editAction || viewAction) && deleteAction &&
                        <DropdownMenuSeparator />
                    }
                    {
                        deleteAction &&
                        <DropdownMenuItem onClick={() => setDelAlertOpen(true)}>
                            Delete
                        </DropdownMenuItem>
                    }
                </DropdownMenuContent>
            </DropdownMenu>
            <DeleteRowAction
                open={delAlertOpen}
                setOpen={setDelAlertOpen}
                onDelete={async () => await deleteAction?.(row.original)} />
        </div>
    )
}



export default function DeleteRowAction(
    { open, setOpen, onDelete }: {
        open: boolean;
        setOpen: (value: boolean) => void;
        onDelete?: () => Promise<void>
    }
) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = async () => {
        setProcessing(true);
        await onDelete?.()
        setProcessing(false);
        setOpen(false);
    }
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will delete the current row.
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
