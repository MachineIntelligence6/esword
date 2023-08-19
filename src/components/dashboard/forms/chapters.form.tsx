'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import clientApiHandlers from "@/client/handlers";
import definedMessages from "@/shared/constants/messages";
import Spinner from "@/components/spinner";
import { z } from 'zod'
import { useRouter } from "next/navigation";
import { ComboBox, SelectEl } from "../../ui/select";
import { useEffect, useState } from "react";
import { IBook, IChapter } from "@/shared/types/models.types";


export const chapterFormSchema = z.object({
    info: z.string().nullable().default(""),
    name: z.number({ required_error: "This field is required." }).min(0, { message: "This field is required." }),
    slug: z.string({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    book: z.number({ required_error: "This field is required." }).min(0, { message: "This field is required." })
})


export type ChapterFormSchema = z.infer<typeof chapterFormSchema>



export default function ChaptersForm({ chapter }: { chapter?: IChapter }) {
    const router = useRouter()
    const [books, setBooks] = useState<IBook[] | null>(null)
    const form = useForm<ChapterFormSchema>({
        resolver: zodResolver(chapterFormSchema),
        mode: "all",
        defaultValues: {
            name: chapter?.name,
            slug: chapter?.slug,
            book: chapter?.bookId
        }
    })
    const { formState } = form



    useEffect(() => {
        clientApiHandlers.books.get({ page: 1, perPage: -1 })
            .then((res) => {
                setBooks(res.data ?? [])
            })
    }, [])



    const updateSlug = () => {
        const bookId = form.getValues("book")
        const nameVal = form.getValues("name")
        if (!bookId || !nameVal) return;
        const book = books?.find((book) => book.id === bookId)
        if (!book) return;
        const slug = `${book.slug}_${nameVal}`
        form.setValue("slug", slug, { shouldValidate: true })
    }



    const resetFormValues = () => {
        form.reset({
            name: undefined,
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
                                    <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number"
                                            required
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e.target.valueAsNumber)
                                                updateSlug()
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
                            name="book"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Book <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            value={field.value?.toString()}
                                            placeholder="Select Book"
                                            onChange={(opt) => {
                                                field.onChange(opt?.value ? Number(opt.value) : undefined)
                                                updateSlug()
                                            }}
                                            ref={field.ref}
                                            loading={!books}
                                            options={books?.map((book) => ({ label: book.name, value: book.id.toString(), rawValue: book }))}
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
                            name="slug"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Slug <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="text" required  {...field} />
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