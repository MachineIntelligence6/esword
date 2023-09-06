'use client';
import { Card, CardContent, CardFooter, CardTitle } from "../../ui/card";
import Spinner from "@/components/spinner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../ui/form";
import { INote } from "@/shared/types/models.types";
import clientApiHandlers from "@/client/handlers";
import { Button } from "../../ui/button";
import { useRouter } from "next/navigation";
import definedMessages from "@/shared/constants/messages";
import Link from "next/link";
import { useSession } from "next-auth/react";
import QuillEditor from "@/components/ui/editor";



export const notesEditorFormSchema = z.object({
    info: z.string().nullable().default(""),
    text: z.string().optional().default(""),
})


export type NotesEditorFormSchema = z.infer<typeof notesEditorFormSchema>




type Props = {
    note: INote;
    readonly?: boolean;
}


export default function NotesEditorForm({ note, readonly }: Props) {
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
        if (readonly) return;
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
                        <div className="col-span-full flex flex-col md:grid grid-cols-2 gap-5">
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
                                        <QuillEditor {...field} disabled={readonly} />
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
                        {
                            !readonly &&
                            <>
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
                            </>
                        }
                    </CardFooter>
                </form>
            </Form>
        </Card>

    )
}



