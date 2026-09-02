"use client";

import { useState } from "react";
import BlogsTable from "@/components/dashboard/tables/blogs.table";
import BlogsForm from "@/components/dashboard/forms/blogs.form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";
import { IBlog } from "@/shared/types/models.types";

export default function Page() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<IBlog | null>(null);

  const openAdd = () => {
    setSelectedBlog(null);
    setPanelOpen(true);
  };

  const openEdit = (blog: IBlog) => {
    setSelectedBlog(blog);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedBlog(null);
  };

  return (
    <div>
      <Card className="min-h-[600px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="font-bold text-2xl">All Blogs</CardTitle>
            <Button type="button" onClick={openAdd}>
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-5 md:p-5">
          <BlogsTable
            editAction={(blog) => (
              <span className="cursor-pointer" onClick={() => openEdit(blog)}>
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
        title={selectedBlog ? "Update Blog" : "Add New Blog"}
        className="sm:max-w-2xl"
      >
        <BlogsForm
          key={selectedBlog?.id ?? "new-blog"}
          blog={selectedBlog ?? undefined}
        />
      </FormSidePanel>
    </div>
  );
}
