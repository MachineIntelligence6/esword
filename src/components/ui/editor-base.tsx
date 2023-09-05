'use client'
import 'react-quill/dist/quill.snow.css';
import { cn } from "@/lib/utils";
import ReactQuill from 'react-quill'
import Quill from 'quill'

import BlotFormatter from 'quill-blot-formatter';
import { EditorProps } from './editor';

Quill.register('modules/blotFormatter', BlotFormatter);




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
                [
                    { align: '' },
                    { align: 'center' },
                    { align: 'right' },
                    { align: 'justify' }
                ],
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



export default function QuillEditorBase({ disabled, readOnly, value, onChange }: EditorProps) {

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
                    disabled && "ql-disabled"
                )}
                onChange={onChange}
                modules={modules(disabled)}
                placeholder="Type..." />
        </div >
    )
}

