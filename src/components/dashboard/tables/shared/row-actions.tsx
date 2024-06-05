import Spinner from "@/components/spinner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableActionProps } from "../shared/types";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { TableActionPopupState } from "./toolbar";
import tableActions from "./table-actions";
import clientApiHandlers from "@/client/handlers";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

interface DataTableRowActionsProps<TData> extends TableActionProps {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
  editAction,
  viewAction,
  archiveAction,
  deleteAction,
  restoreAction,
  modelName,
}: DataTableRowActionsProps<TData>) {
  const { data: session } = useSession();
  const [alertOpen, setAlertOpen] = React.useState<TableActionPopupState>({
    state: false,
    type: "RESTORE",
  });
  const archived = (row.original as any).archived;
  const deleteEnabled = session?.user && session.user.role === "ADMIN";

  const warningMessage = () => {
    if (alertOpen.type === "RESTORE")
      return `This action will restore the ${modelName.toLowerCase()} and all data linked with it.`;
    if (alertOpen.type === "ARCHIVE")
      return `This action will move the ${modelName.toLowerCase()} and all data linked with it to archive.`;
    if (alertOpen.type === "DELETE")
      return `This action will delete (permanantly) the ${modelName.toLowerCase()} and all data linked with it.`;
  };

  const actionPopupProps: TableActionPopupProps = {
    title: "Warning!",
    description: warningMessage() ?? "",
    actionBtn: {
      text: "Continue",
      variant: alertOpen.type === "RESTORE" ? "default" : "destructive",
    },
    open: alertOpen.state,
    setOpen: (value) => setAlertOpen({ state: value, type: "RESTORE" }),
    action: async () => {
      if (alertOpen.type === "RESTORE") {
        await tableActions.restore(
          [row.original],
          modelName,
          `${modelName} restored successfully.`
        );
      } else if (alertOpen.type === "DELETE") {
        await tableActions.deletePermanantly(
          [row.original],
          modelName,
          `${modelName} and all data linked with it deleted successfully.`
        );
      } else if (alertOpen.type === "ARCHIVE") {
        await tableActions.archive(
          [row.original],
          modelName,
          `${modelName} and all data linked with it moved to archive successfully.`
        );
      }
    },
  };

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
          {viewAction && (
            <DropdownMenuItem asChild>
              {viewAction(row.original)}
            </DropdownMenuItem>
          )}
          {editAction && (
            <DropdownMenuItem asChild>
              {editAction(row.original)}
            </DropdownMenuItem>
          )}
          {(editAction || viewAction) && deleteEnabled && (
            <DropdownMenuSeparator />
          )}
          {archived
            ? restoreAction && (
                <DropdownMenuItem
                  onClick={() => setAlertOpen({ state: true, type: "RESTORE" })}
                >
                  Restore
                </DropdownMenuItem>
              )
            : deleteEnabled && (
                <>
                  {archiveAction && (
                    <DropdownMenuItem
                      onClick={() =>
                        setAlertOpen({ state: true, type: "ARCHIVE" })
                      }
                    >
                      Archive
                    </DropdownMenuItem>
                  )}
                  {deleteAction && (
                    <DropdownMenuItem
                      onClick={() =>
                        setAlertOpen({ state: true, type: "DELETE" })
                      }
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </>
              )}
        </DropdownMenuContent>
      </DropdownMenu>
      {<TableActionPopup {...actionPopupProps} />}
    </div>
  );
}

export type TableActionPopupProps = {
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpen: (value: boolean) => void;
  action?: () => Promise<void>;
  title: string;
  description: string;
  actionBtn: {
    variant?:
      | "link"
      | "default"
      | "primary"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost";
    text: string;
  };
};

const passwordVeifySchema = z.object({
  password: z
    .string({ required_error: "Required!" })
    .min(1, { message: "Required!" }),
});

type PasswordVerifySchema = z.infer<typeof passwordVeifySchema>;

export function TableActionPopup({
  open,
  setOpen,
  action,
  title,
  description,
  actionBtn,
}: TableActionPopupProps) {
  const [processing, setProcessing] = useState(false);
  const form = useForm<PasswordVerifySchema>({
    resolver: zodResolver(passwordVeifySchema),
    mode: "onSubmit",
  });

  const handleDoAction = async (formData: PasswordVerifySchema) => {
    if (!formData.password) return;
    setProcessing(true);
    await clientApiHandlers.users
      .verifyPassword(formData.password)
      .then(async (res) => {
        if (res.succeed) {
          await action?.();
          setOpen(false);
        } else {
          form.setError("password", {
            message: "Wrong password",
            type: "validate",
          });
        }
      });
    setProcessing(false);
  };
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!processing) setOpen(value);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-orange-500">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line pt-3">
            {description}
            <br />
            Enter your password below to continue
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleDoAction)}>
            <div>
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" required {...field} />
                    </FormControl>
                    {fieldState.error && <FormMessage />}
                  </FormItem>
                )}
              />
            </div>
            <AlertDialogFooter className="mt-5">
              <AlertDialogCancel type="button" disabled={processing}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                variant={actionBtn.variant}
                disabled={
                  !form.formState.isDirty ||
                  !form.getValues("password") ||
                  form.formState.isSubmitting
                }
              >
                {processing ? (
                  <Spinner className="border-white" />
                ) : (
                  <span>{actionBtn.text}</span>
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
