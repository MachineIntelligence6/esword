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
Quill.register("modules/preserveWhiteSpace", PreserveWhiteSpace);

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

  // Effect to handle image changes
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const handleEditorChange = () => {
      const content = sanitizeRichHtml(quill.root.innerHTML);
      if (onChange) {
        onChange(content);
      }
    };

    quill.on("text-change", handleEditorChange);

    return () => {
      quill.off("text-change", handleEditorChange);
    };
  }, [onChange]);

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
        value={sanitizeRichHtml(value)}
        className={cn(
          "w-full",
          disabled ? "ql-disabled" : "min-300",
          maxHeight && "max-600",
          className
        )}
        onChange={(content, delta, source, editor) => {
          if (onChange) {
            onChange(sanitizeRichHtml(editor.getHTML()));
          }
        }}
        modules={getModules(disabled)}
        placeholder={disabled || readOnly ? "" : "Type..."}
      />
    </div>
  );
};

export default QuillEditorBase;
