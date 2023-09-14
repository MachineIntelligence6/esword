'use client'
import { useState } from "react";
import { ITopic } from "@/shared/types/models.types";
import TopicsTable from "@/components/dashboard/tables/topics.table";
import { AddTopicForm, EditTopicForm } from "@/components/dashboard/forms/topics.form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



export default function Page() {
  const [selectedTopic, setSelectedTopic] = useState<ITopic | null>(null);

  return (
    <div className="xl:grid grid-cols-12 gap-5">
      <div className="col-span-8 w-full">
        <Card className="min-h-[600px]">
          <CardHeader className="border-b-8 border-silver-light py-4">
            <CardTitle className="font-bold text-2xl">
              All Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-5 md:p-5">
            <TopicsTable
              editAction={(topic: ITopic) => (
                <span onClick={() => setSelectedTopic(topic)}>
                  Edit
                </span>
              )}
            />

          </CardContent>
        </Card>
      </div>
      <div className="col-span-4">
        {
          selectedTopic ?
            <EditTopicForm topic={selectedTopic} onReset={() => setSelectedTopic(null)} />
            :
            <AddTopicForm />
        }
      </div>
    </div>
  )
}