'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, InputEl } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import apiClientActions from "@/client/actions";
import definedMessages from "@/shared/constants/messages";
import { Author, Book, Chapter, Commentary, Verse, VerseType } from "@prisma/client";
import Spinner from "@/components/spinner";
import { z } from 'zod'
import { useRouter } from "next/navigation";
import { ComboBox, SelectEl } from "../ui/select";
import Link from "next/link";
import { Textarea } from "../ui/textarea";


export const commentaryFormSchema = z.object({
    info: z.string().nullable().default(""),
    name: z.string({ required_error: "This field is required." }),
    text: z.string({ required_error: "This field is required." }),
    author: z.any({ required_error: "This field is required." }),
    verse: z.any({ required_error: "This field is required." }),
})


export type CommentaryFormSchema = z.infer<typeof commentaryFormSchema>


export default function CommentariesForm({ verses, commentary, authors }: { commentary?: Commentary, verses: Verse[], authors: Author[] }) {
    const router = useRouter()
    const form = useForm<CommentaryFormSchema>({
        resolver: zodResolver(commentaryFormSchema),
        mode: "onBlur",
        defaultValues: {
            name: commentary?.name,
            verse: verses.find((b) => b.id === commentary?.verseId),
            author: authors.find((b) => b.id === commentary?.authorId),
            text: commentary?.text,
        }
    })
    const { formState } = form


    const resetFormValues = () => {
        form.reset({
            name: "",
            text: "",
            verse: undefined,
            author: undefined,
        })
    }




    const handleAddNew = async (data: CommentaryFormSchema) => {
        const res = await apiClientActions.commentaries.create(data)
        if (res.succeed && res.data) return router.push(`/dashboard/commentaries/${res.data.id}`)
        if (res.code === "UNKOWN_ERROR") {
            form.setError("info", {
                message: definedMessages.UNKNOWN_ERROR
            })
        }
    }

    const handleUpdate = async (data: CommentaryFormSchema) => {
        if (!commentary) return;
        const res = await apiClientActions.commentaries.update(commentary.id, data)
        if (res.succeed && res.data) return router.push(`/dashboard/commentaries/${res.data.id}`)
        if (res.code === "UNKOWN_ERROR") {
            form.setError("info", {
                message: definedMessages.UNKNOWN_ERROR
            })
        }
    }


    return (
        <Card className="w-full rounded-md">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(commentary ? handleUpdate : handleAddNew)}>
                    <CardContent className="gap-5 pt-5 grid grid-cols-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input type="text" {...field} />
                                    </FormControl>
                                    {
                                        fieldState.error &&
                                        <FormMessage />
                                    }
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="author"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Author</FormLabel>
                                    <FormControl>
                                        <ComboBox
                                            placeholder="Select Author"
                                            onChange={(opt) => {
                                                if (opt?.value) {
                                                    field.onChange(opt.rawValue)
                                                }
                                            }}
                                            ref={field.ref}
                                            options={authors.map((author) => ({
                                                label: author.name,
                                                value: author.id.toString(),
                                                rawValue: author
                                            }))}
                                            value={field.value?.id?.toString()}
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
                            control={form.control}
                            name="verse"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Verse</FormLabel>
                                    <FormControl>
                                        <ComboBox
                                            placeholder="Select Verse"
                                            onChange={(opt) => {
                                                if (opt?.value) {
                                                    field.onChange(opt.rawValue)
                                                }
                                            }}
                                            ref={field.ref}
                                            options={verses.map((verse) => ({
                                                label: verse.name,
                                                value: verse.id.toString(),
                                                rawValue: verse
                                            }))}
                                            value={field.value?.id?.toString()}
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
                            control={form.control}
                            name="text"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-full">
                                    <FormLabel>Text</FormLabel>
                                    <FormControl>
                                        <Textarea rows={8} {...field} />
                                    </FormControl>
                                    {
                                        fieldState.error &&
                                        <FormMessage />
                                    }
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
                        <Link href="/dashboard/chapters" className={buttonVariants({ variant: "outline" })} >Cancel</Link>
                        <Button
                            type="submit"
                            disabled={!formState.isDirty || formState.isSubmitting}>
                            {
                                formState.isSubmitting ?
                                    <Spinner className="border-white" />
                                    :
                                    commentary ? "Update" : "Add"
                            }
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card >
    )
}