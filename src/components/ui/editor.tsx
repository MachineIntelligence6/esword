"use client";
import dynamic from "next/dynamic";
import Spinner from "../spinner";

const QuillEditorBase = dynamic(
  () => import("@/components/ui/editor-base").then((mode) => mode.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    ),
  }
);

export type EditorProps = {
  disabled?: boolean;
  readOnly?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  maxHeight?: boolean;
};

export default function QuillEditor(props: EditorProps) {
  return <QuillEditorBase {...props} />;
}
