'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, InputEl } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import apiClientActions from "@/client/actions";
import definedMessages from "@/shared/constants/messages";
import { Book, Chapter, Verse, VerseType } from "@prisma/client";
import Spinner from "@/components/spinner";
import { z } from 'zod'
import { useRouter } from "next/navigation";
import { ComboBox, SelectEl } from "../ui/select";
import Link from "next/link";
import { Textarea } from "../ui/textarea";


export const verseFormSchema = z.object({
    info: z.string().nullable().default(""),
    name: z.string({ required_error: "This field is required." }),
    book: z.any({ required_error: "This field is required." }),
    chapter: z.any({ required_error: "This field is required." }),
    number: z.number({ required_error: "This field is required." }),
    text: z.string({ required_error: "This field is required." }),
    type: z.string({ required_error: "This field is required" })
})


export type VerseFormSchema = z.infer<typeof verseFormSchema>



export default function VersesForm({ books, verse }: { verse?: Verse, books: Book[] }) {
    const router = useRouter()
    const form = useForm<VerseFormSchema>({
        resolver: zodResolver(verseFormSchema),
        mode: "onBlur",
        defaultValues: {
            name: verse?.name,
            book: books.find((b) => b.id === (verse as any)?.chapter?.bookId),
            chapter: (verse as any)?.chapter,
            text: verse?.text,
            type: verse?.type,
            number: verse?.number,
        }
    })
    const { formState } = form


    const resetFormValues = () => {
        form.reset({
            name: "",
            text: "",
            type: undefined,
            chapter: undefined,
            book: undefined,
            number: undefined
        })
    }




    const handleAddNew = async (data: VerseFormSchema) => {
        const res = await apiClientActions.verses.create(data)
        if (res.succeed && res.data) return router.push(`/dashboard/verses/${res.data.id}`)
        if (res.code === "VERSE_NUMBER_MUST_BE_UNIQUE") {
            form.setError("number", {
                message: definedMessages.VERSE_NUMBER_MUST_BE_UNIQUE
            })
        }
        if (res.code === "UNKOWN_ERROR") {
            form.setError("info", {
                message: definedMessages.UNKNOWN_ERROR
            })
        }
    }

    const handleUpdate = async (data: VerseFormSchema) => {
        if (!verse) return;
        const res = await apiClientActions.verses.update(verse.id, data)
        if (res.succeed && res.data) return router.push(`/dashboard/verses/${res.data.id}`)
        if (res.code === "VERSE_NUMBER_MUST_BE_UNIQUE") {
            form.setError("number", {
                message: definedMessages.VERSE_NUMBER_MUST_BE_UNIQUE
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
                    onSubmit={form.handleSubmit(verse ? handleUpdate : handleAddNew)}>
                    <CardContent className="gap-5 pt-5 grid grid-cols-2">
                        <FormField
                            control={form.control}
                            name="book"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Book</FormLabel>
                                    <FormControl>
                                        <ComboBox
                                            placeholder="Select Book"
                                            onChange={(opt) => {
                                                if (opt?.value) {
                                                    field.onChange(opt.rawValue)
                                                    form.resetField("chapter", { defaultValue: undefined })
                                                }
                                            }}
                                            ref={field.ref}
                                            options={books.map((book) => ({
                                                label: book.name,
                                                value: book.id.toString(),
                                                rawValue: book
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
                            name="chapter"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Chapter</FormLabel>
                                    <FormControl>
                                        <ComboBox
                                            placeholder="Select Chapter"
                                            disabled={!form.getValues("book")}
                                            onChange={(opt) => {
                                                if (opt?.value) {
                                                    field.onChange(opt.rawValue)
                                                }
                                            }}
                                            ref={field.ref}
                                            options={form.getValues("book")?.chapters?.map((chapter: Chapter) => ({
                                                label: chapter.name,
                                                value: chapter.id.toString(),
                                                rawValue: chapter
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
                            name="number"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Number</FormLabel>
                                    <FormControl>
                                        <InputEl
                                            leading={
                                                <span>
                                                    {(form.getValues("book") as Book)?.abbreviation} {(form.getValues("chapter") as Chapter)?.number}
                                                </span>
                                            }
                                            type="number"
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)} />
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
                            name="type"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            placeholder="Select Type"
                                            onChange={(opt) => {
                                                if (opt?.value) {
                                                    console.log(opt.value)
                                                    field.onChange(opt.value)
                                                }
                                            }}
                                            options={[VerseType.CONTENT, VerseType.HEADING].map((type) => ({
                                                label: type,
                                                value: type,
                                                rawValue: type
                                            }))}
                                            value={field.value}
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
                                    verse ? "Update" : "Add"
                            }
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card >
    )
}