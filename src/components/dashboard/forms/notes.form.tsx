'use client';
import dynamic from "next/dynamic";
import { Card, CardContent, CardFooter, CardTitle } from "../ui/card";
import 'react-quill/dist/quill.snow.css';
import Spinner from "@/components/spinner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { SelectEl } from "../ui/select";
import { useEffect, useState } from "react";
import { IBook, IChapter, INote, ITopic, IUser, IVerse } from "@/shared/types/models.types";
import clientApiHandlers from "@/client/handlers";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link";
import { useSession } from "next-auth/react";


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
})


export type NotesEditorFormSchema = z.infer<typeof notesEditorFormSchema>




type Props = {
    note: INote;
}


export default function NotesEditorForm({ note }: Props) {
    const router = useRouter()
    const { data: session } = useSession();
    const form = useForm<NotesEditorFormSchema>({
        resolver: zodResolver(notesEditorFormSchema),
        mode: "all",
        defaultValues: {
            text: note.text,
        }
    })
    const { formState } = form;





    const handleUpdate = async (data: NotesEditorFormSchema) => {
        const res = await clientApiHandlers.notes.update(note.id, data.text)
        if (res.succeed && res.data) return router.push(`/dashboard/notes`)
        if (res.code === "UNKOWN_ERROR") {
            form.setError("info", {
                message: definedMessages.UNKNOWN_ERROR
            })
        }
    }



    return (
        <Card className="w-full rounded-md">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdate)}>
                    <CardContent className="gap-5 p-5 grid grid-cols-2">
                        <div className="col-span-full grid grid-cols-2 gap-5">
                            <Card className="w-full p-5">
                                <CardTitle>User Details</CardTitle>
                                <CardContent className="px-0 pt-5">
                                    <div className="flex items-center gap-5">
                                        <span className="w-16 text-sm">Name: </span>
                                        {
                                            session?.user && session?.user.role === "ADMIN" ?
                                                <Link href={`/dashboard/users/${note.userId}`}
                                                    className="font-semibold text-primary">
                                                    {note.user?.name}
                                                </Link>
                                                :
                                                <h3 className="font-semibold">
                                                    {note.user?.name}
                                                </h3>
                                        }
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <span className="w-16 text-sm">Email: </span>
                                        <p>{note.user?.email}</p>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <span className="w-16 text-sm">Role: </span>
                                        <p>{note.user?.role}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="w-full p-5">
                                <CardTitle>Other Details</CardTitle>
                                <CardContent className="px-0 pt-5">
                                    <div className="flex items-center gap-5">
                                        <span className="w-16 text-sm">Book: </span>
                                        <p>{note.verse?.topic?.chapter?.book?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <span className="w-16 text-sm">Chapter: </span>
                                        <p>{note.verse?.topic?.chapter?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <span className="w-16 text-sm">Topic: </span>
                                        <p className="line-clamp-1">{note.verse?.topic?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <span className="w-16 text-sm">Verse: </span>
                                        <p>{note.verse?.number}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <FormField
                            name="text"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-full">
                                    <FormControl>
                                        <div id="editor-container">
                                            <ReactQuill
                                                theme="snow"
                                                bounds="#editor-container"
                                                {...field}
                                                formats={formats}
                                                modules={modules}
                                                placeholder="Type..." />
                                        </div>
                                    </FormControl>
                                    {fieldState.error && <FormMessage />}
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="info"
                            render={({ fieldState }) => (
                                <FormItem className="mt-5">
                                    {
                                        fieldState.error &&
                                        <FormMessage />
                                    }
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            disabled={formState.isSubmitting}
                            onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!formState.isDirty || formState.isSubmitting}>
                            {
                                formState.isSubmitting ?
                                    <Spinner className="border-white" />
                                    :
                                    "Update"
                            }
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>

    )
}



