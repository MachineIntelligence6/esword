'use client'
import dynamic from "next/dynamic";
import Spinner from "../spinner";
import 'react-quill/dist/quill.snow.css';
import { cn } from "@/lib/utils";




const ReactQuill = dynamic(() => import("react-quill"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-96 flex items-center justify-center">
            <Spinner size="lg" />
        </div>
    )
});


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
                    { 'list': 'ordered' },
                    { 'list': 'bullet' },
                    { 'indent': '-1' },
                    { 'indent': '+1' }
                ],
                ['link'],
                ['clean']
            ],
        }),
        clipboard: {
            matchVisual: false,
        }
    }
}

const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link'
]


type Props = {
    disabled?: boolean;
    readOnly?: boolean;
    value?: string;
    onChange?: (value: string) => void
}


export default function QuillEditor({ disabled, readOnly, value, onChange }: Props) {

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
                className="w-full"
                onChange={onChange}
                modules={modules(disabled)}
                placeholder="Type..." />
        </div >
    )
}

