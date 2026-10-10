"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clientApiHandlers from "@/client/handlers";
import { ActivityDetails, IActivity } from "@/shared/types/models.types";
import { FormSidePanel } from "./form-side-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/spinner";

type Props = {
  activity: IActivity | null;
  onOpenChange: (open: boolean) => void;
};

const ACTION_LABEL: Record<string, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  ARCHIVE: "Archived",
  RESTORE: "Restored",
};

const MODEL_LABEL: Record<string, string> = {
  BOOKS: "Book",
  CHAPTERS: "Chapter",
  TOPICS: "Topic",
  VERSES: "Verse",
  NOTES: "Note",
  USERS: "User",
  BLOGS: "Blog",
  AUTHORS: "Author",
  COMMENTARIES: "Commentary",
  BOOKMARKS: "Bookmark",
  ABOUTCONTENT: "About page",
};

export function ActivityDetailsPanel({ activity, onOpenChange }: Props) {
  const [details, setDetails] = useState<ActivityDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!activity) return;
    let cancelled = false;
    setDetails(null);
    setFailed(false);
    setLoading(true);
    clientApiHandlers.activities.getDetails(activity.id).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.succeed && res.data) setDetails(res.data);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [activity]);

  return (
    <FormSidePanel
      open={!!activity}
      onOpenChange={onOpenChange}
      title="Activity details"
    >
      {activity && (
        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{ACTION_LABEL[activity.action] ?? activity.action}</Badge>
              <Badge variant="outline">
                {MODEL_LABEL[activity.model] ?? activity.model}
              </Badge>
            </div>
            <h2 className="text-lg font-bold">{activity.description}</h2>
            <p className="text-sm text-slate-500">
              {activity.user?.name ?? "Unknown user"} ·{" "}
              {new Date(activity.timestamp).toLocaleString()}
            </p>
          </div>

          {loading && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}

          {!loading && failed && (
            <p className="text-sm text-red-500">
              Could not load details for this activity.
            </p>
          )}

          {!loading && details && (
            <div className="space-y-4">
              {details.breadcrumb.length > 0 && (
                <p className="text-sm text-slate-500">
                  {details.breadcrumb.join(" › ")}
                </p>
              )}

              {details.fields.length > 0 && (
                <dl className="space-y-3 rounded-sm border border-slate-200 p-4">
                  {details.fields.map((field) => (
                    <div key={field.label}>
                      <dt className="text-xs font-semibold uppercase text-slate-500">
                        {field.label}
                      </dt>
                      <dd className="text-sm">{field.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {details.archived && (
                <p className="text-sm text-amber-600">
                  This record is currently archived.
                </p>
              )}

              {details.viewHref ? (
                <Button asChild>
                  <Link href={details.viewHref}>
                    View {MODEL_LABEL[activity.model]?.toLowerCase() ?? "record"}
                  </Link>
                </Button>
              ) : (
                details.fields.length === 0 &&
                details.breadcrumb.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No further details are available for this activity.
                  </p>
                )
              )}
            </div>
          )}
        </div>
      )}
    </FormSidePanel>
  );
}
