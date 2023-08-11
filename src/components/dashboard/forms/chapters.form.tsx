'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/dashboard/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/dashboard/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button, buttonVariants } from "@/components/dashboard/ui/button";
import clientApiHandlers from "@/client/handlers";
import definedMessages from "@/shared/constants/messages";
import { Book, Chapter } from "@prisma/client";
import Spinner from "@/components/spinner";
import { z } from 'zod'
import { useRouter } from "next/navigation";
import { ComboBox, SelectEl } from "../ui/select";
import Link from "next/link";


export const chapterFormSchema = z.object({
    info: z.string().nullable().default(""),
    name: z.string({ required_error: "This field is required." }),
    slug: z.string({ required_error: "This field is required." }),
    book: z.number({ required_error: "This field is required." })
})


export type ChapterFormSchema = z.infer<typeof chapterFormSchema>



export default function ChaptersForm({ chapter, books }: { chapter?: Chapter, books: Book[] }) {
    const router = useRouter()
    const form = useForm<ChapterFormSchema>({
        resolver: zodResolver(chapterFormSchema),
        mode: "onBlur",
        defaultValues: {
            name: chapter?.name,
            slug: chapter?.slug,
            book: chapter?.bookId
        }
    })
    const { formState } = form

    const onNameChange = () => {
        const nameVal = form.getValues("name")
        if (!nameVal) return;
        const slug = nameVal.toLowerCase().replaceAll(" ", "_")
        form.setValue("slug", slug, { shouldValidate: true })
    }



    const resetFormValues = () => {
        form.reset({
            name: "",
            slug: "",
            book: undefined
        })
    }




    const handleAddNew = async (data: ChapterFormSchema) => {
        const res = await clientApiHandlers.chapters.create(data)
        if (res.succeed && res.data) return router.push("/dashboard/chapters")
        if (res.code === "SLUG_MUST_BE_UNIQUE") {
            form.setError("slug", {
                message: definedMessages.SLUG_MUST_BE_UNIQUE
            })
        }
        if (res.code === "UNKOWN_ERROR") {
            form.setError("info", {
                message: definedMessages.UNKNOWN_ERROR
            })
        }
    }

    const handleUpdate = async (data: ChapterFormSchema) => {
        if (!chapter) return;
        const res = await clientApiHandlers.chapters.update(chapter.id, data)
        if (res.succeed && res.data) return router.push("/dashboard/chapters")
        if (res.code === "SLUG_MUST_BE_UNIQUE") {
            form.setError("slug", {
                message: definedMessages.SLUG_MUST_BE_UNIQUE
            })
        }
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
                    onSubmit={form.handleSubmit(chapter ? handleUpdate : handleAddNew)}>
                    <CardContent className="gap-5 pt-5 grid grid-cols-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input type="text"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e)
                                                onNameChange()
                                            }} />
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
                            name="slug"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input type="text"  {...field} />
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
                            name="book"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Book</FormLabel>
                                    <FormControl>
                                        <ComboBox
                                            value={field.value?.toString()}
                                            placeholder="Select Book"
                                            onChange={(opt) => {
                                                if (opt?.value) {
                                                    field.onChange(parseInt(opt.value))
                                                }
                                            }}
                                            ref={field.ref}
                                            options={books.map((book) => ({ label: book.name, value: book.id.toString(), rawValue: book }))}
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
                        <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                        <Button
                            type="submit"
                            disabled={!formState.isDirty || formState.isSubmitting}>
                            {
                                formState.isSubmitting ?
                                    <Spinner className="border-white" />
                                    :
                                    chapter ? "Update" : "Add"
                            }
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card >
    )
}