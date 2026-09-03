"use client";

import clientApiHandlers from "@/client/handlers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Spinner from "@/components/spinner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";

const CSV_COLUMNS = [
  { name: "Book", example: "Genesis" },
  { name: "Abbreviation", example: "Gen" },
  { name: "Chapter", example: "1" },
  { name: "Topic", example: "Opening words" },
  { name: "Verse", example: "1" },
  { name: "Text", example: "In the beginning…" },
] as const;

export function ImportIVersesComponent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [importMode, setImportMode] = useState<"update" | "overwrite">(
    "update"
  );
  const { toast } = useToast();

  const handleFilesChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast({
          title: "Invalid file",
          description: "Please choose a .csv file.",
          variant: "destructive",
        });
        return;
      }
      setPickedFile(file);
    }
  };

  const discardFile = () => {
    setPickedFile(null);
    setProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportData = async () => {
    if (!pickedFile) return;
    setProcessing(true);
    const res = await clientApiHandlers.verses.importFromCSV(
      pickedFile,
      importMode
    );
    if (res.succeed) router.push("/dashboard/verses");
    else {
      toast({
        title: "Import failed",
        description:
          "Could not process the file. Check the sample format and try again.",
        variant: "destructive",
      });
    }
    setProcessing(false);
  };

  return (
    <div className="overflow-hidden rounded-sm border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-950">
          Import verses
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload a CSV to create or update books, chapters, topics, and verses.
          Columns are separated by{" "}
          <code className="rounded-xs bg-slate-100 px-1 py-0.5 text-xs font-medium text-slate-800">
            $
          </code>
          , not commas.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
          <input
            type="file"
            hidden
            accept=".csv,text/csv"
            onChange={(e) => handleFilesChange(e.target.files)}
            ref={fileInputRef}
          />

          <div
            role={!pickedFile && !processing ? "button" : undefined}
            tabIndex={!pickedFile && !processing ? 0 : undefined}
            onClick={() => {
              if (!pickedFile && !processing) fileInputRef.current?.click();
            }}
            onKeyDown={(e) => {
              if (
                !pickedFile &&
                !processing &&
                (e.key === "Enter" || e.key === " ")
              ) {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!processing) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!processing) handleFilesChange(e.dataTransfer.files);
            }}
            className={cn(
              "flex min-h-[220px] flex-col items-center justify-center rounded-sm border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition-colors duration-fast",
              dragging && "border-primary bg-accent-subtle",
              !pickedFile &&
                !processing &&
                "cursor-pointer hover:border-slate-400 hover:bg-white",
              processing && "opacity-70"
            )}
          >
            {processing ? (
              <Spinner className="h-10 w-10 border-4" />
            ) : pickedFile ? (
              <FileSpreadsheet className="h-9 w-9 text-primary-dark" />
            ) : (
              <Upload className="h-9 w-9 text-slate-500" />
            )}

            <h3 className="mt-4 text-base font-semibold text-slate-950">
              {processing
                ? "Importing…"
                : pickedFile
                  ? pickedFile.name
                  : "Drop CSV here or click to browse"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              {processing
                ? "Please wait while rows are processed."
                : pickedFile
                  ? `${(pickedFile.size / 1024).toFixed(1)} KB · choose a mode below, then start import`
                  : "Accepts .csv files using the $ delimiter shown in the sample."}
            </p>

            {!pickedFile && !processing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose file
              </Button>
            )}
          </div>

          {pickedFile && (
            <div className="mt-5 space-y-4">
              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold text-slate-950">
                  Import mode
                </legend>
                <label
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-sm border border-slate-200 p-3 transition-colors",
                    importMode === "update" &&
                      "border-primary bg-accent-subtle"
                  )}
                >
                  <input
                    type="radio"
                    name="importMode"
                    value="update"
                    checked={importMode === "update"}
                    onChange={() => setImportMode("update")}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">
                      Update
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-600">
                      Keep existing data; create missing books/chapters/topics
                      and add or refresh matching verses.
                    </span>
                  </span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-sm border border-slate-200 p-3 transition-colors",
                    importMode === "overwrite" &&
                      "border-danger bg-danger-subtle"
                  )}
                >
                  <input
                    type="radio"
                    name="importMode"
                    value="overwrite"
                    checked={importMode === "overwrite"}
                    onChange={() => setImportMode("overwrite")}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">
                      Overwrite
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-600">
                      Delete books named in the file first, then import fresh
                      from the CSV. Destructive — use carefully.
                    </span>
                  </span>
                </label>
              </fieldset>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={processing}
                  onClick={discardFile}
                >
                  Discard
                </Button>
                <Button
                  type="button"
                  disabled={processing}
                  onClick={handleImportData}
                >
                  {processing ? (
                    <Spinner className="h-5 w-5 border-2" />
                  ) : (
                    "Start import"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5 p-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-950">
                Required format
              </h3>
              <Button asChild variant="outline" size="sm">
                <a
                  href="/samples/verses-import-sample.csv"
                  download="verses-import-sample.csv"
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  Sample CSV
                </a>
              </Button>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Header row required. Field separator is{" "}
              <Badge variant="secondary">$</Badge>
              . Download the sample and keep the same column order.
            </p>
          </div>

          <div className="overflow-hidden rounded-sm border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-3 py-2 font-semibold text-slate-500">
                    Column
                  </th>
                  <th className="px-3 py-2 font-semibold text-slate-500">
                    Example
                  </th>
                </tr>
              </thead>
              <tbody>
                {CSV_COLUMNS.map((col) => (
                  <tr
                    key={col.name}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-3 py-2 font-medium text-slate-950">
                      {col.name}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{col.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-sm border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Example row
            </p>
            <code className="mt-2 block break-all text-xs leading-5 text-slate-800">
              Genesis$Gen$1$Opening words$1$In the beginning God created…
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
