import { Suspense } from "react";
import ArchivesPage from "./archives-client";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading archives…</div>}>
      <ArchivesPage />
    </Suspense>
  );
}
