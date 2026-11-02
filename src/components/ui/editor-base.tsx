"use client";
import "react-quill-new/dist/quill.snow.css";
import React, { useEffect, useRef, MutableRefObject } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import { cn } from "@/lib/utils";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import { EditorProps } from "./editor";

const BaseImageFormat = Quill.import("formats/image") as any;
const ImageFormatAttributesList = ["alt", "height", "width", "style"];

class ImageFormat extends BaseImageFormat {
  domNode: any;

  static formats(domNode: any) {
    // tslint:disable-next-line: only-arrow-functions
    return ImageFormatAttributesList.reduce(function (
      formats: any,
      attribute: any
    ) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    },
    {});
  }
  format(name: any, value: any) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register(ImageFormat as any, true);

// Define a class to preserve white space
class PreserveWhiteSpace {
  constructor(private quill: any) {
    quill.container.style.whiteSpace = "pre-line";
  }
}

const quillGlobals = globalThis as typeof globalThis & {
  __eswordPreserveWhiteSpaceRegistered?: boolean;
};
if (!quillGlobals.__eswordPreserveWhiteSpaceRegistered) {
  Quill.register("modules/preserveWhiteSpace", PreserveWhiteSpace);
  quillGlobals.__eswordPreserveWhiteSpaceRegistered = true;
}

// Define the modules for the editor
// const getModules = (disabled?: boolean) => ({
//   toolbar: !disabled
//     ? [
//         [{ header: [1, 2, 3, 4, 5, 6, false] }],
//         [{ font: [] }],
//         ["bold", "italic", "underline", "strike", "blockquote"],
//         [
//           { list: "ordered" },
//           { list: "bullet" },
//           { indent: "-1" },
//           { indent: "+1" },
//         ],
//         ["link", "image"],
//         ["clean"],
//       ]
//     : null,
//   blotFormatter: {},
//   preserveWhiteSpace: true,
//   clipboard: {
//     matchVisual: false,
//   },
// });
const getModules = (disabled?: boolean) => {
  return {
    ...(disabled
      ? { toolbar: null }
      : {
          toolbar: [
            [
              { header: "1" },
              { header: "2" },
              { header: [1, 2, 3, 4, 5, 6, false] },
            ],
            [{ font: [] }],
            // [{ size: [] }],
            // [{ 'color': [] }, { 'background': [] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            // [
            //     { align: '' },
            //     { align: 'center' },
            //     { align: 'right' },
            //     { align: 'justify' }
            // ],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" },
            ],
            ["link", "image"],
            ["clean"],
          ],
        }),
    preserveWhiteSpace: true,
    clipboard: {
      matchVisual: false,
    },
  };
};

// Define the formats for the editor
// Quill 2 registers list bullets via "list"; custom image attrs are handled by ImageFormat.
const formats = [
  "header",
  "font",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "indent",
  "link",
  "image",
];

const QuillEditorBase = ({
  disabled,
  readOnly,
  value,
  onChange,
  className,
  maxHeight = true,
}: EditorProps) => {
  const quillRef: MutableRefObject<ReactQuill | null> = useRef(null);
  // Edits sent to onChange that haven't come back as `value` yet.
  const pendingEdits = useRef<string[]>([]);

  // The editor owns its text. Quill's copy escapes quotes (&quot;, &#39;) while
  // the sanitized HTML we hand out doesn't, so a controlled `value` never
  // matched it: Quill reloaded the text, changed again and looped forever,
  // freezing the page whenever the text had a " or '. Now a `value` is loaded
  // only when it's new (another note opened, a form reset), not our own edit
  // coming back.
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const echoed = pendingEdits.current.indexOf(value ?? "");
    if (echoed !== -1) {
      pendingEdits.current.splice(0, echoed + 1);
      return;
    }
    pendingEdits.current = [];
    const next = sanitizeRichHtml(value);
    if (next !== sanitizeRichHtml(quill.root.innerHTML)) {
      quill.setContents(quill.clipboard.convert({ html: next }));
    }
  }, [value]);

  return (
    <div
      id="editor-container"
      className={cn("w-full h-full", readOnly && "pointer-events-none")}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        bounds="#editor-container"
        readOnly={readOnly || disabled}
        formats={formats}
        defaultValue={sanitizeRichHtml(value)}
        className={cn(
          "w-full",
          disabled ? "ql-disabled" : "min-300",
          maxHeight && "max-600",
          className
        )}
        onChange={(content, delta, source, editor) => {
          // Loading a value isn't an edit; only report what the user typed.
          if (source !== "user") return;
          const clean = sanitizeRichHtml(editor.getHTML());
          pendingEdits.current = [...pendingEdits.current.slice(-20), clean];
          onChange?.(clean);
        }}
        modules={getModules(disabled)}
        placeholder={disabled || readOnly ? "" : "Type..."}
      />
    </div>
  );
};

export default QuillEditorBase;
