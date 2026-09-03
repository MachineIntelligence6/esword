"use client";

import ActivitiesTable from "@/components/dashboard/tables/activities.table";
import { ListPageShell } from "@/components/dashboard/list-page-shell";

export default function Page() {
  return (
    <ListPageShell title="Activities">
      <ActivitiesTable hideSearch />
    </ListPageShell>
  );
}
