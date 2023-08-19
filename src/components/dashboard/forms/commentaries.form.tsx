'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/dashboard/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/dashboard/ui/input";
import { Card, CardContent, CardFooter } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import clientApiHandlers from "@/client/handlers";
import definedMessages from "@/shared/constants/messages";
import Spinner from "@/components/spinner";
import { z } from 'zod'
import { useRouter, useSearchParams } from "next/navigation";
import { ComboBox, SelectEl } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useEffect, useState } from "react";
import { IAuthor, IBook, IChapter, ICommentary, ITopic, IVerse } from "@/shared/types/models.types";


export const commentaryFormSchema = z.object({
    info: z.string().nullable().default(""),
    name: z.string({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    text: z.string({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    author: z.number({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    verse: z.number({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    book: z.number({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    chapter: z.number({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    topic: z.number({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
})


export type CommentaryFormSchema = z.infer<typeof commentaryFormSchema>


export default function CommentariesForm({ commentary }: { commentary?: ICommentary }) {
    const [books, setBooks] = useState<IBook[] | null>(null)
    const [authors, setAuthors] = useState<IAuthor[] | null>(null)
    const searchParams = useSearchParams()
    const params = {
        book: () => {
            const bookId = searchParams.get("book")
            return bookId ? parseInt(bookId) : undefined
        },
        chapter: () => {
            const chapterId = searchParams.get("chapter")
            return chapterId ? parseInt(chapterId) : undefined
        },
        verse: () => {
            const verseId = searchParams.get("verse")
            return verseId ? parseInt(verseId) : undefined
        },
        author: () => {
            const authorId = searchParams.get("author")
            return authorId ? parseInt(authorId) : undefined
        },
        topic: () => {
            const topicId = searchParams.get("topic")
            return topicId ? parseInt(topicId) : undefined
        },
    }
    const router = useRouter()
    const form = useForm<CommentaryFormSchema>({
        resolver: zodResolver(commentaryFormSchema),
        mode: "all",
        defaultValues: {
            name: commentary?.name,
            verse: commentary ? commentary?.verseId : params.verse(),
            author: commentary?.authorId,
            chapter: commentary ? commentary?.verse?.topic?.chapter?.id : params.chapter(),
            book: commentary ? commentary?.verse?.topic?.chapter?.book?.id : params.book(),
            text: commentary?.text,
            topic: commentary ? commentary?.verse?.topicId : params.topic()
        }
    })
    const { formState } = form
    const [chapters, setChapters] = useState<IChapter[] | null>(null)
    const [topics, setTopics] = useState<ITopic[] | null>(null)
    const [verses, setVerses] = useState<IVerse[] | null>(null)



    useEffect(() => {
        clientApiHandlers.books.get({
            page: 1, perPage: -1, include: {
                chapters: {
                    include: {
                        topics: {
                            include: {
                                verses: { where: { archived: false } }
                            },
                            where: { archived: false }
                        }
                    },
                    where: { archived: false }
                }
            }
        })
            .then((res) => {
                setBooks(res.data ?? [])
            })
        clientApiHandlers.authors.get({ page: 1, perPage: -1 })
            .then((res) => {
                setAuthors(res.data ?? [])
            })
    }, [])


    const resetFormValues = () => {
        form.reset({
            name: "",
            text: "",
            verse: undefined,
            author: undefined,
            chapter: undefined,
            book: undefined,
        })
    }



    const handleAddNew = async (data: CommentaryFormSchema) => {
        const res = await clientApiHandlers.commentaries.create(data)
        if (res.succeed && res.data) return router.push(`/dashboard/commentaries/${res.data.id}`)
        if (res.code === "UNKOWN_ERROR") {
            form.setError("info", {
                message: definedMessages.UNKNOWN_ERROR
            })
        }
    }

    const handleUpdate = async (data: CommentaryFormSchema) => {
        if (!commentary) return;
        const res = await clientApiHandlers.commentaries.update(commentary.id, data)
        if (res.succeed && res.data) return router.push(`/dashboard/commentaries/${res.data.id}`)
        if (res.code === "UNKOWN_ERROR") {
            form.setError("info", {
                message: definedMessages.UNKNOWN_ERROR
            })
        }
    }



    useEffect(() => {
        const getChaptersList = () => {
            const bookId = form.getValues("book")
            if (!bookId) return null
            const book = books?.find((b) => b.id === bookId);
            return book?.chapters ?? []
        }
        const getTopicsList = () => {
            const chapterId = form.getValues("chapter")
            if (!chapterId) return null
            const chapters = getChaptersList();
            const chapter = chapters?.find((ch) => ch.id === chapterId);
            return chapter?.topics ?? []
        }
        const getVersesList = () => {
            const topicId = form.getValues("topic")
            if (!topicId) return null
            const topics = getTopicsList();
            const topic = topics?.find((topic) => topic.id === topicId);
            return topic?.verses ?? []
        }
        setChapters(getChaptersList())
        setTopics(getTopicsList())
        setVerses(getVersesList())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.formState])



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
                                    <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
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
                            name="author"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Author <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            placeholder="Select Author"
                                            onChange={(opt) => {
                                                field.onChange(opt?.value ? Number(opt.value) : undefined)
                                            }}
                                            ref={field.ref}
                                            loading={!authors}
                                            options={authors?.map((author) => ({
                                                label: author.name,
                                                value: author.id.toString(),
                                                rawValue: author
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
                                            disabled={!chapters}
                                            onChange={(opt) => {
                                                field.onChange(opt?.value ? Number(opt.value) : undefined)
                                                form.resetField("topic", { defaultValue: undefined })
                                            }}
                                            ref={field.ref}
                                            options={chapters?.map((chapter) => ({
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
                                            disabled={!topics}
                                            onChange={(opt) => {
                                                field.onChange(opt?.value ? Number(opt.value) : undefined)
                                                form.resetField("verse", { defaultValue: undefined })
                                            }}
                                            ref={field.ref}
                                            options={topics?.map((topic) => ({
                                                label: topic.name,
                                                value: topic.id.toString(),
                                                rawValue: topic
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
                            name="verse"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Verse <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            placeholder="Select IVerse"
                                            disabled={!verses}
                                            onChange={(opt) => {
                                                field.onChange(opt?.value ? Number(opt.value) : undefined)
                                            }}
                                            ref={field.ref}
                                            options={verses?.map((verse: IVerse) => ({
                                                label: `${verse.number} (${verse.text.substring(0, 30)}...)`,
                                                value: verse.id.toString(),
                                                rawValue: verse
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
                                    commentary ? "Update" : "Add"
                            }
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card >
    )
}