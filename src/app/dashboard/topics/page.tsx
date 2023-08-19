'use client'
import { useState } from "react";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link";
import { ITopic } from "@/shared/types/models.types";
import TopicsTable from "@/components/dashboard/tables/topics.table";
import { AddTopicForm, EditTopicForm } from "@/components/dashboard/forms/topics.form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



export default function Page() {
  const [selectedTopic, setSelectedTopic] = useState<ITopic | null>(null);
  const { toast } = useToast();

  const handleDelete = async (topic: ITopic) => {
    const res = await clientApiHandlers.topics.archive(topic.id)
    if (res.succeed) {
      window.location.reload()
    } else if (res.code === "DATA_LINKED") {
      toast({
        title: "Topic can not be deleted.",
        variant: "destructive",
        description: "All verses linked with this topic must be unlinked in order to delete this topic."
      })
    } else {
      toast({
        title: "Error",
        variant: "destructive",
        description: definedMessages.UNKNOWN_ERROR
      })
    }
  }
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-8 w-full">
        <Card className="min-h-[600px]">
          <CardHeader className="border-b-8 border-silver-light py-4">
            <CardTitle className="font-bold text-2xl">
              All Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <TopicsTable
              viewAction={(topic: ITopic) => (
                <Link href={`/dashboard/topics/${topic.id}`}>View</Link>
              )}
              editAction={(topic: ITopic) => (
                <span onClick={() => setSelectedTopic(topic)}>
                  Edit
                </span>
              )}
              deleteAction={handleDelete} />

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