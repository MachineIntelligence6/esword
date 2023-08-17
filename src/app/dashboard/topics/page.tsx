'use client'
import { useState } from "react";
import clientApiHandlers from "@/client/handlers";
import { useToast } from "@/components/dashboard/ui/use-toast";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link";
import { ITopic } from "@/shared/types/models.types";
import TopicsTable from "@/components/dashboard/tables/topics.table";
import { AddTopicForm, EditTopicForm } from "@/components/dashboard/forms/topics.form";



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
    <div className="space-y-8">
      <div>
        <h1 className="font-bold text-2xl">
          All Topics
        </h1>
      </div>
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-8 w-full">
          {
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
          }
        </div>
        <div className="col-span-4 mt-12">
          {
            selectedTopic ?
              <EditTopicForm topic={selectedTopic} onReset={() => setSelectedTopic(null)} />
              :
              <AddTopicForm />
          }
        </div>
      </div>
    </div>
  )
}