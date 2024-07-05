"use client";
import clientApiHandlers from "@/client/handlers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Spinner from "@/components/spinner";
import { cn } from "@/lib/utils";
import { FileIcon, UploadIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function ImportIVersesComponent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [importMode, setImportMode] = useState<"update" | "overwrite">(
    "update"
  );
  const { toast } = useToast();

  const handleFilesChange = (e: any) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPickedFile(files[0]);
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
    const res = await clientApiHandlers.verses.importFromCSV(pickedFile, importMode);
    if (res.succeed) router.push("/dashboard/verses");
    else {
      toast({
        title: "Error",
        description:
          "An error occured while processing your request. Please make sure file has valid data and try again.",
        variant: "destructive",
      });
    }
    setProcessing(false);
  };
  const handleImportModeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setImportMode(value as "update" | "overwrite");
  };

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <input
          type="file"
          hidden
          accept=".csv"
          onChange={handleFilesChange}
          ref={fileInputRef}
        />
        <div
          {...(!pickedFile &&
            !processing && { onClick: () => fileInputRef.current?.click() })}
          className={cn(
            "flex flex-col items-center justify-center text-center w-full h-full",
            "p-10 py-16 hover:bg-gray-50 rounded-xl",
            !pickedFile && !processing && "cursor-pointer"
          )}
        >
          {pickedFile ? (
            <FileIcon className="w-8 h-8" />
          ) : processing ? (
            <Spinner className="w-10 h-10 border-4" />
          ) : (
            <UploadIcon className="w-8 h-8" />
          )}
          <h3 className="text-xl mt-8 font-semibold">
            {pickedFile ? pickedFile.name : "Import Verses"}
          </h3>
          <p className="text-sm">
            {processing
              ? "Please wait, file is being processed."
              : !pickedFile && "Click here to pick verses csv file."}
          </p>
          {pickedFile && (
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mt-5 flex items-center gap-3">
                <input
                  type="radio"
                  name="importMode"
                  value="update"
                  id="update"
                  checked={importMode === "update"}
                  onChange={handleImportModeChange}
                />
                <label htmlFor="update">Update</label>

                <input
                  type="radio"
                  name="importMode"
                  value="overwrite"
                  id="overwrite"
                  checked={importMode === "overwrite"}
                  onChange={handleImportModeChange}
                />
                <label htmlFor="overwrite">Overwrite</label>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <Button
                  type="button"
                  disabled={processing}
                  variant="destructive"
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
                    <Spinner className="w-5 h-5" />
                  ) : (
                    <span>Start Import</span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
