"use client";

import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type FormSidePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FormSidePanel({
  open,
  onOpenChange,
  title = "Details",
  description,
  children,
  className,
}: FormSidePanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn("overflow-y-auto p-4 pt-4", className)}>
        <SheetHeader className="sr-only">
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : (
            <SheetDescription>Add or edit record details.</SheetDescription>
          )}
        </SheetHeader>
        <div className="[&>*]:!border-0 [&>*]:!shadow-none [&>*]:!rounded-none">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
