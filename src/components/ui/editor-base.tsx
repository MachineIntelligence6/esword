'use client'
import 'react-quill/dist/quill.snow.css';
import { cn } from "@/lib/utils";
import ReactQuill from 'react-quill'
import Quill from 'quill'

import BlotFormatter from 'quill-blot-formatter';
import { EditorProps } from './editor';

Quill.register('modules/blotFormatter', BlotFormatter);


class PreserveWhiteSpace {
    constructor(private quill: any, private options: {}) {
        quill.container.style.whiteSpace = "pre-line";
    }
}
Quill.register('modules/preserveWhiteSpace', PreserveWhiteSpace);


const modules = (disabled?: boolean) => {
    return {
        ...(disabled ? { toolbar: null } : {
            toolbar: [
                [
                    { 'header': '1' },
                    { 'header': '2' },
                    { 'header': [1, 2, 3, 4, 5, 6, false] }
                ],
                [{ 'font': [] }],
                // [{ size: [] }],
                // [{ 'color': [] }, { 'background': [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                // [
                //     { align: '' },
                //     { align: 'center' },
                //     { align: 'right' },
                //     { align: 'justify' }
                // ],
                [
                    { 'list': 'ordered' },
                    { 'list': 'bullet' },
                    { 'indent': '-1' },
                    { 'indent': '+1' }
                ],
                ['link', 'image'],
                ['clean']
            ],
            blotFormatter: {
                // see config options below
            }
        }),
        preserveWhiteSpace: true,
        clipboard: {
            matchVisual: false,
        },
    }
}

const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
]



export default function QuillEditorBase({ disabled, readOnly, value, onChange, className, maxHeight = true }: EditorProps) {

    return (
        <div id="editor-container"
            className={cn(
                "w-full h-full",
                readOnly && "pointer-events-none"
            )}>
            <ReactQuill
                theme="snow"
                bounds="#editor-container"
                readOnly={readOnly || disabled}
                formats={formats}
                value={value}
                className={cn(
                    "w-full",
                    disabled ? "ql-disabled" : "min-300",
                    maxHeight && "max-600",
                    className
                )}
                onChange={onChange}
                modules={modules(disabled)}
                placeholder={(disabled || readOnly) ? "" : "Type..."} />
        </div >
    )
}

