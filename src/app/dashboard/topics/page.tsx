"use client";

import { useState } from "react";
import { ITopic } from "@/shared/types/models.types";
import TopicsTable from "@/components/dashboard/tables/topics.table";
import {
  AddTopicForm,
  EditTopicForm,
} from "@/components/dashboard/forms/topics.form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormSidePanel } from "@/components/dashboard/form-side-panel";

export default function Page() {
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
    <div>
      <Card className="min-h-[600px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="font-bold text-2xl">All Topics</CardTitle>
            <Button type="button" onClick={openAdd}>
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-5 md:p-5">
          <TopicsTable
            editAction={(topic: ITopic) => (
              <span
                className="cursor-pointer"
                onClick={() => openEdit(topic)}
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
    </div>
  );
}
