"use client";

import { useState } from "react";
import { ITopic } from "@/shared/types/models.types";
import TopicsTable from "@/components/dashboard/tables/topics.table";
import {
  AddTopicForm,
  EditTopicForm,
} from "@/components/dashboard/forms/topics.form";
import { Button } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";
import { useParentListFilters } from "@/components/dashboard/tables/shared/parent-filters";
import { ListPageShell } from "@/components/dashboard/list-page-shell";

export default function Page() {
  const { bookIds, chapterIds } = useParentListFilters();
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ITopic | null>(null);

  const openAdd = () => {
    setSelectedTopic(null);
    setPanelOpen(true);
  };

  const openEdit = (topic: ITopic) => {
    setSelectedTopic(topic);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setSelectedTopic(null);
  };

  return (
    <>
      <ListPageShell
        title="Topics"
        showParentFilters
        showChapterFilter
        addAction={
          <Button type="button" onClick={openAdd}>
            Add New
          </Button>
        }
      >
        <TopicsTable
          bookIds={bookIds}
          chapterIds={chapterIds}
          hideSearch
          editAction={(topic: ITopic) => (
            <span className="cursor-pointer" onClick={() => openEdit(topic)}>
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
        title={selectedTopic ? "Update Topic" : "Add New Topic"}
        className="sm:max-w-xl"
      >
        {selectedTopic ? (
          <EditTopicForm
            key={selectedTopic.id}
            topic={selectedTopic}
            onReset={closePanel}
          />
        ) : (
          <AddTopicForm key="new-topic" />
        )}
      </FormSidePanel>
    </>
  );
}
