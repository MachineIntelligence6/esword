"use client";

import { ListPageShell } from "@/components/dashboard/list-page-shell";
import { ImportIVersesComponent } from "./components";

export default function Page() {
  return (
    <ListPageShell title="Settings" showSearch={false}>
      <ImportIVersesComponent />
    </ListPageShell>
  );
}
