'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/dashboard/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/dashboard/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import clientApiHandlers from "@/client/handlers";
import definedMessages from "@/shared/constants/messages";
import Spinner from "@/components/spinner";
import { useEffect } from "react";
import { z } from 'zod'
import { IBook } from "@/shared/types/models.types";


export const bookFormSchema = z.object({
    info: z.string().nullable().default(""),
    name: z.string({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    slug: z.string({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    abbreviation: z.string({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
})


export type BookFormSchema = z.infer<typeof bookFormSchema>




type BookFormProps = {
    book?: IBook | null;
    onReset?: () => void;
}


export default function BooksForm({ book, onReset }: BookFormProps) {
    const form = useForm<BookFormSchema>({
        resolver: zodResolver(bookFormSchema),
        mode: "all"
    })
    const { formState } = form


    const onNameChange = () => {
        const nameVal = form.getValues("name")
        if (!nameVal) return;
        const slug = nameVal.toLowerCase().replaceAll(" ", "_")
        form.setValue("slug", slug, { shouldValidate: true })
    }

    useEffect(() => {
        if (!book) return;
        form.reset({
            name: book.name,
            slug: book.slug,
            abbreviation: book.abbreviation
        })
    }, [book, form])


    const resetFormValues = () => {
        form.reset({
            name: "",
            slug: "",
            abbreviation: ""
        })
    }


    const resetForm = () => {
        if (book && onReset) onReset()
        resetFormValues()
    }


    const handleAddNewBook = async (data: BookFormSchema) => {
        const res = await clientApiHandlers.books.create(data)
        if (res.succeed && res.data) {
            return window.location.reload()
        }
        if (res.code === "SLUG_MUST_BE_UNIQUE") {
            form.setError("slug", {
                message: definedMessages.SLUG_MUST_BE_UNIQUE
            })
        }
        if (res.code === "BOOK_NAME_MUST_BE_UNIQUE") {
            form.setError("name", {
                message: definedMessages.BOOK_NAME_MUST_BE_UNIQUE
            })
        }
        if (res.code === "UNKOWN_ERROR") {
            form.setError("info", {
                message: definedMessages.UNKNOWN_ERROR
            })
        }
    }


    const handleUpdateBook = async (data: BookFormSchema) => {
        if (!book) return;
        const res = await clientApiHandlers.books.update(book.id, data)
        if (res.succeed && res.data) {
            return window.location.reload()
        }
        if (res.code === "SLUG_MUST_BE_UNIQUE") {
            form.setError("slug", {
                message: definedMessages.SLUG_MUST_BE_UNIQUE
            })
        }
        if (res.code === "BOOK_NAME_MUST_BE_UNIQUE") {
            form.setError("name", {
                message: definedMessages.BOOK_NAME_MUST_BE_UNIQUE
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
                    onSubmit={form.handleSubmit(book ? handleUpdateBook : handleAddNewBook)}>
                    <CardHeader>
                        <CardTitle>
                            {book ? "Update Book" : "Add New Book"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Book Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="text"
                                            required
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
                                <FormItem>
                                    <FormLabel>Slug <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="text" required {...field} />
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
                            name="abbreviation"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Abbreviation <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="text" required {...field} />
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
                        {
                            formState.isDirty || book ?
                                <Button variant="outline" type="button" onClick={resetForm}>Cancel</Button>
                                :
                                <span></span>
                        }
                        <Button
                            type="submit"
                            disabled={!formState.isDirty || formState.isSubmitting}>
                            {
                                formState.isSubmitting ?
                                    <Spinner className="border-white" />
                                    :
                                    book ? "Update" : "Add"
                            }
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card >
    )
}