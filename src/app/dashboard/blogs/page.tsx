"use client";

import { useState } from "react";
import BlogsTable from "@/components/dashboard/tables/blogs.table";
import BlogsForm from "@/components/dashboard/forms/blogs.form";
import { Button } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";
import { IBlog } from "@/shared/types/models.types";
import { ListPageShell } from "@/components/dashboard/list-page-shell";

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
    <>
      <ListPageShell
        title="Blogs"
        addAction={
          <Button type="button" onClick={openAdd}>
            Add New
          </Button>
        }
      >
        <BlogsTable
          hideSearch
          editAction={(blog) => (
            <span className="cursor-pointer" onClick={() => openEdit(blog)}>
              Edit
            </span>
          )}
        />
      </ListPageShell>

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
    </>
  );
}
