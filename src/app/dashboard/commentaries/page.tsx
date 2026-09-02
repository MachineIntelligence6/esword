"use client";

import { useState } from "react";
import Link from "next/link";
import CommentariesTable from "@/components/dashboard/tables/commentaries.table";
import CommentariesForm from "@/components/dashboard/forms/commentaries.form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";
import { ICommentary } from "@/shared/types/models.types";

export default function Page() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedCommentary, setSelectedCommentary] =
    useState<ICommentary | null>(null);

  const openEdit = (commentary: ICommentary) => {
    setSelectedCommentary(commentary);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedCommentary(null);
  };

  return (
    <div>
      <Card className="min-h-[600px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="font-bold text-2xl">All Commentaries</CardTitle>
            <Link
              href="/dashboard/commentaries/add"
              className={buttonVariants({ variant: "default" })}
            >
              Add New
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-5 md:p-5">
          <CommentariesTable
            editAction={(commentary: ICommentary) => (
              <span
                className="cursor-pointer"
                onClick={() => openEdit(commentary)}
              >
                Edit
              </span>
            )}
          />
        </CardContent>
      </Card>

      <FormSidePanel
        open={panelOpen}
        onOpenChange={(open) => {
          if (!open) closePanel();
          else setPanelOpen(true);
        }}
        title="Update Commentary"
        className="sm:max-w-2xl"
      >
        {selectedCommentary ? (
          <CommentariesForm
            key={selectedCommentary.id}
            commentary={selectedCommentary}
          />
        ) : null}
      </FormSidePanel>
    </div>
  );
}
