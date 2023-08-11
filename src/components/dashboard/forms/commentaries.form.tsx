'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/dashboard/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/dashboard/ui/input";
import { Card, CardContent, CardFooter } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import clientApiHandlers from "@/client/handlers";
import definedMessages from "@/shared/constants/messages";
import { Author, Book, Chapter, Commentary, Verse } from "@prisma/client";
import Spinner from "@/components/spinner";
import { z } from 'zod'
import { useRouter, useSearchParams } from "next/navigation";
import { ComboBox } from "../ui/select";
import { Textarea } from "../ui/textarea";


export const commentaryFormSchema = z.object({
    info: z.string().nullable().default(""),
    name: z.string({ required_error: "This field is required." }),
    text: z.string({ required_error: "This field is required." }),
    author: z.number({ required_error: "This field is required." }),
    verse: z.number({ required_error: "This field is required." }),
    book: z.number({ required_error: "This field is required." }),
    chapter: z.number({ required_error: "This field is required." }),
})


export type CommentaryFormSchema = z.infer<typeof commentaryFormSchema>


export default function CommentariesForm(
    { books, commentary, authors }: {
        commentary?: Commentary, books: Book[], authors: Author[]
    }
) {
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
    }
    const router = useRouter()
    const form = useForm<CommentaryFormSchema>({
        resolver: zodResolver(commentaryFormSchema),
        mode: "onBlur",
        defaultValues: {
            name: commentary?.name,
            verse: commentary ? commentary?.verseId : params.verse(),
            author: commentary?.authorId,
            chapter: commentary ? (commentary as any)?.verse?.chapter?.id : params.chapter(),
            book: commentary ? (commentary as any)?.verse?.chapter?.book?.id : params.book(),
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



    const getChaptersList = () => {
        const bookId = form.getValues("book")
        if (!bookId) return []
        const book = books.find((b) => b.id === bookId);
        return (book as any)?.chapters ?? []
    }
    const getVersesList = () => {
        const chapterId = form.getValues("chapter")
        if (!chapterId) return []
        const chapters = getChaptersList();
        const chapter = chapters?.find((ch: Chapter) => ch.id === chapterId);
        return (chapter as any)?.verses ?? []
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
                                                    field.onChange(parseInt(opt.value))
                                                }
                                            }}
                                            ref={field.ref}
                                            options={authors.map((author) => ({
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
                                    <FormLabel>Book</FormLabel>
                                    <FormControl>
                                        <ComboBox
                                            placeholder="Select Book"
                                            onChange={(opt) => {
                                                if (opt?.value) {
                                                    field.onChange(parseInt(opt.value))
                                                }
                                            }}
                                            ref={field.ref}
                                            options={books.map((book) => ({
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
                                    <FormLabel>Chapter</FormLabel>
                                    <FormControl>
                                        <ComboBox
                                            placeholder="Select Chapter"
                                            disabled={!form.getValues("book")}
                                            onChange={(opt) => {
                                                if (opt?.value) {
                                                    field.onChange(parseInt(opt.value))
                                                }
                                            }}
                                            ref={field.ref}
                                            options={getChaptersList()?.map((chapter: Chapter) => ({
                                                label: chapter.name,
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
                            name="verse"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Verse</FormLabel>
                                    <FormControl>
                                        <ComboBox
                                            placeholder="Select Verse"
                                            disabled={!form.getValues("chapter")}
                                            onChange={(opt) => {
                                                if (opt?.value) {
                                                    field.onChange(parseInt(opt.value))
                                                }
                                            }}
                                            ref={field.ref}
                                            options={getVersesList()?.map((verse: Verse) => ({
                                                label: verse.name,
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