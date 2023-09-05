'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { InputEl } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import clientApiHandlers from "@/client/handlers";
import definedMessages from "@/shared/constants/messages";
import Spinner from "@/components/spinner";
import { z } from 'zod'
import { useRouter } from "next/navigation";
import { ComboBox, SelectEl } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { useEffect, useState } from "react";
import { IBook, IVerse } from "@/shared/types/models.types";


export const verseFormSchema = z.object({
    info: z.string().nullable().default(""),
    book: z.number({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    chapter: z.number({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    topic: z.number({ required_error: "This field is required" }).min(1, { message: "This field is required." }),
    number: z.number({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    text: z.string({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
})


export type VerseFormSchema = z.infer<typeof verseFormSchema>



export default function VersesForm({ verse }: { verse?: IVerse }) {
    const [books, setBooks] = useState<IBook[] | null>(null)
    const router = useRouter()
    const form = useForm<VerseFormSchema>({
        resolver: zodResolver(verseFormSchema),
        mode: "all",
        defaultValues: {
            book: verse?.topic?.chapter?.bookId,
            chapter: verse?.topic?.chapterId,
            text: verse?.text,
            number: verse?.number,
            topic: verse?.topicId
        }
    })
    const { formState } = form



    useEffect(() => {
        clientApiHandlers.books.get({
            page: 1, perPage: -1, include: {
                chapters: {
                    where: { archived: false },
                    include: { topics: { where: { archived: false } } }
                }
            }
        })
            .then((res) => {
                setBooks(res.data ?? [])
            })
    }, [])



    const resetFormValues = () => {
        form.reset({
            text: "",
            topic: undefined,
            chapter: undefined,
            book: undefined,
            number: undefined
        })
    }




    const handleAddNew = async (data: VerseFormSchema) => {
        const res = await clientApiHandlers.verses.create(data)
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
        const res = await clientApiHandlers.verses.update(verse.id, data)
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


    const getChaptersList = () => {
        const bookId = form.getValues("book")
        if (!bookId) return []
        const book = books?.find((b) => b.id === bookId);
        return book?.chapters ?? []
    }
    const getBook = () => {
        const bookId = form.getValues("book")
        if (!bookId) return null
        return books?.find((b) => b.id === bookId);
    }
    const getChapter = () => {
        const chapterId = form.getValues("chapter")
        if (!chapterId) return null
        const chapters = getChaptersList();
        return chapters?.find((ch) => ch.id === chapterId)
    }

    const getTopicsList = () => {
        const chapter = getChapter();
        return chapter?.topics
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
                                    <FormLabel>Book <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            placeholder="Select Book"
                                            onChange={(opt) => {
                                                field.onChange(opt?.value ? Number(opt.value) : undefined)
                                                form.resetField("chapter", { defaultValue: undefined })
                                            }}
                                            ref={field.ref}
                                            loading={!books}
                                            options={books?.map((book) => ({
                                                label: book.name,
                                                value: book.id.toString(),
                                                rawValue: book
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
                            control={form.control}
                            name="chapter"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Chapter <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            placeholder="Select Chapter"
                                            disabled={!form.getValues("book")}
                                            onChange={(opt) => {
                                                field.onChange(opt && Number(opt.value))
                                            }}
                                            ref={field.ref}
                                            options={getChaptersList()?.map((chapter) => ({
                                                label: String(chapter.name),
                                                value: chapter.id.toString(),
                                                rawValue: chapter
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
                            control={form.control}
                            name="topic"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Topic <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            placeholder="Select Topic"
                                            onChange={(opt) => {
                                                field.onChange(Number(opt?.value))
                                            }}
                                            options={getTopicsList()?.map((topic) => ({
                                                label: topic.name,
                                                value: topic.id.toString(),
                                                rawValue: topic
                                            }))}
                                            value={String(field.value)}
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
                            name="number"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Number <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <InputEl
                                            leading={
                                                <span>
                                                    {getBook()?.abbreviation} {getChapter()?.name} :
                                                </span>
                                            }
                                            type="number"
                                            required
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
                            name="text"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-full">
                                    <FormLabel>Text <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea rows={8} required {...field} />
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
                                    verse ? "Update" : "Add"
                            }
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card >
    )
}