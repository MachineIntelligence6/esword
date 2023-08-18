'use client';
import dynamic from "next/dynamic";
import { Card, CardContent } from "../ui/card";
import 'react-quill/dist/quill.snow.css';
import Spinner from "@/components/spinner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { SelectEl } from "../ui/select";
import { useEffect, useState } from "react";
import { IUser } from "@/shared/types/models.types";
import clientApiHandlers from "@/client/handlers";


const ReactQuill = dynamic(() => import("react-quill"), {
    ssr: false,
    loading: () => <div className="w-full h-96 flex items-center justify-center">
        <Spinner size="lg" />
    </div>
});


const modules = {
    toolbar: [
        [
            { 'header': '1' },
            { 'header': '2' },
            { 'header': [1, 2, 3, 4, 5, 6, false] }
        ],
        [{ 'font': [] }],
        [{ size: [] }],
        [{ 'color': [] }, { 'background': [] }],
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
    clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
    }
}

const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link'
]



export const notesEditorFormSchema = z.object({
    info: z.string().nullable().default(""),
    text: z.string().optional().default(""),
    user: z.number({ required_error: "This field is required." }),
    verse: z.number({ required_error: "This field is required." }),
})


export type NotesEditorFormSchema = z.infer<typeof notesEditorFormSchema>



export default function NotesEditorForm() {
    const form = useForm<NotesEditorFormSchema>({
        resolver: zodResolver(notesEditorFormSchema),
        mode: "all"
    })
    const [users, setUsers] = useState<IUser[] | null>(null)


    useEffect(() => {
        clientApiHandlers.users.get({ page: 1, perPage: -1, role: "VIEWER" })
            .then((res) => {
                setUsers(res.data ?? [])
            })
    }, [])


    return (
        <Card className="w-full rounded-md">
            <Form {...form}>
                <form>
                    <CardContent className="gap-5 p-5 grid grid-cols-2">
                        <FormField
                            control={form.control}
                            name="user"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>User <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            placeholder="Select User"
                                            onChange={(opt) => {
                                                field.onChange(opt?.value ? Number(opt.value) : undefined)
                                            }}
                                            ref={field.ref}
                                            loading={!users}
                                            options={users?.map((user) => ({
                                                label: user.name,
                                                value: user.id.toString(),
                                                rawValue: user
                                            }))}
                                            value={field.value?.toString()}
                                        />
                                    </FormControl>
                                    {
                                        fieldState.error &&
                                        <FormMessage />
                                    }
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="text"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-full">
                                    <FormControl>
                                        <ReactQuill
                                            theme="snow"
                                            {...field}
                                            formats={formats}
                                            modules={modules}
                                            placeholder="Type..." />
                                    </FormControl>
                                    {fieldState.error && <FormMessage />}
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </form>
            </Form>
        </Card>

    )
}



