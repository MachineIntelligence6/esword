'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { FileInput, Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import clientApiHandlers from "@/client/handlers";
import definedMessages from "@/shared/constants/messages";
import Spinner from "@/components/spinner";
import { z } from 'zod'
import { useRouter } from "next/navigation";
import { SelectEl } from "../../ui/select";
import { useEffect, useMemo, useState } from "react";
import { IBlog, IBook, IChapter, IVerse } from "@/shared/types/models.types";
import { BlogType } from "@prisma/client";
import QuillEditor from "@/components/ui/editor";
import Image from "next/image";
import { TagsInput } from "react-tag-input-component";

export const blogsFormSchema = z.object({
    info: z.string().nullable().default(""),
    title: z.string({ required_error: "This field is required." }),
    slug: z.string({ required_error: "This field is required." }),
    content: z.string({ required_error: "This field is required." }),
    image: z.string().nullable().default(null),
    type: z.string({ required_error: "This field is required." }),
    tags: z.array(z.string(), { required_error: "This field is required." }).optional().default([]),
    book: z.number({ required_error: "Book is required." }).min(1, { message: "Book is required." }),
    chapter: z.number().optional().nullable(),
    verse: z.number().optional().nullable(),
})

export type BlogsFormSchema = z.infer<typeof blogsFormSchema>

export default function BlogsForm({ blog }: { blog?: IBlog }) {
    const router = useRouter()
    const [books, setBooks] = useState<IBook[] | null>(null)
    const form = useForm<BlogsFormSchema>({
        resolver: zodResolver(blogsFormSchema),
        mode: "all",
        defaultValues: {
            info: "",
            title: blog?.title ?? "",
            slug: blog?.slug ?? "",
            content: blog?.content ?? "",
            type: blog?.type ?? "",
            image: blog?.image ?? null,
            tags: blog?.tags
                ? blog.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
                : [],
            book: blog?.bookId,
            chapter: blog?.chapterId ?? null,
            verse: blog?.verseId ?? null,
        }
    })
    const { formState, watch, setValue } = form
    const selectedBookId = watch("book")
    const selectedChapterId = watch("chapter")

    useEffect(() => {
        clientApiHandlers.books.get({
            page: 1,
            perPage: -1,
            include: {
                chapters: {
                    where: { archived: false },
                    include: {
                        topics: {
                            where: { archived: false },
                            include: {
                                verses: { where: { archived: false } },
                            },
                        },
                    },
                },
            },
        }).then((res) => {
            setBooks(res.data ?? [])
        })
    }, [])

    const chapters: IChapter[] = useMemo(() => {
        if (!selectedBookId || !books) return []
        return books.find((b) => b.id === selectedBookId)?.chapters ?? []
    }, [books, selectedBookId])

    const verses: IVerse[] = useMemo(() => {
        if (!selectedChapterId) return []
        const chapter = chapters.find((ch) => ch.id === selectedChapterId)
        return (chapter?.topics ?? []).flatMap((t) => t.verses ?? [])
    }, [chapters, selectedChapterId])

    const updateSlug = () => {
        const titleVal = form.getValues("title")
        if (!titleVal) return;
        const slug = titleVal.toLowerCase().replaceAll(" ", "_").replaceAll("/", "_")
        form.setValue("slug", slug, { shouldValidate: true })
    }

    const resetFormValues = () => {
        form.reset({
            info: "",
            title: "",
            slug: "",
            type: "",
            content: "",
            image: null,
            tags: [],
            book: undefined,
            chapter: null,
            verse: null,
        })
    }

    const mapError = (code?: string) => {
        if (code === "SLUG_MUST_BE_UNIQUE") {
            form.setError("slug", { message: definedMessages.SLUG_MUST_BE_UNIQUE })
            return
        }
        if (code === "INVALID_RELATIONSHIP") {
            form.setError("info", { message: definedMessages.INVALID_RELATIONSHIP })
            return
        }
        if (code === "VALIDATION_ERROR") {
            form.setError("info", { message: definedMessages.VALIDATION_ERROR })
            return
        }
        form.setError("info", { message: definedMessages.UNKNOWN_ERROR })
    }

    const handleAddNew = async (data: BlogsFormSchema) => {
        const res = await clientApiHandlers.blogs.create(data)
        if (res.succeed && res.data) return router.push("/dashboard/blogs")
        mapError(res.code)
    }

    const handleUpdate = async (data: BlogsFormSchema) => {
        if (!blog) return;
        const res = await clientApiHandlers.blogs.update(blog.id, data)
        if (res.succeed && res.data) return router.push("/dashboard/blogs")
        mapError(res.code)
    }

    return (
        <Card className="w-full rounded-md">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(blog ? handleUpdate : handleAddNew)}>
                    <CardContent className="gap-5 pt-5 grid grid-cols-2">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="text"
                                            required
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e.target.value)
                                                updateSlug()
                                            }} />
                                    </FormControl>
                                    {fieldState.error && <FormMessage />}
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
                                    {fieldState.error && <FormMessage />}
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Type <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            value={field.value}
                                            placeholder="Select Type"
                                            onChange={(opt) => field.onChange(opt?.value)}
                                            ref={field.ref}
                                            options={[BlogType.MANUSCRIPT, BlogType.PROBLEM].map((type) => ({
                                                label: type,
                                                value: type,
                                                rawValue: type,
                                            }))}
                                        />
                                    </FormControl>
                                    {fieldState.error && <FormMessage />}
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
                                            value={field.value ? String(field.value) : undefined}
                                            placeholder="Select Book"
                                            loading={!books}
                                            onChange={(opt) => {
                                                field.onChange(opt?.rawValue ? Number(opt.rawValue) : undefined)
                                                setValue("chapter", null)
                                                setValue("verse", null)
                                            }}
                                            ref={field.ref}
                                            options={(books ?? []).map((book) => ({
                                                label: book.name,
                                                value: String(book.id),
                                                rawValue: book.id,
                                            }))}
                                        />
                                    </FormControl>
                                    {fieldState.error && <FormMessage />}
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="chapter"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Chapter (optional)</FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            value={field.value ? String(field.value) : undefined}
                                            placeholder={selectedBookId ? "Entire book / select chapter" : "Select a book first"}
                                            disabled={!selectedBookId}
                                            onChange={(opt) => {
                                                field.onChange(opt?.rawValue ? Number(opt.rawValue) : null)
                                                setValue("verse", null)
                                            }}
                                            ref={field.ref}
                                            options={chapters.map((ch) => ({
                                                label: `Chapter ${ch.name}`,
                                                value: String(ch.id),
                                                rawValue: ch.id,
                                            }))}
                                        />
                                    </FormControl>
                                    {fieldState.error && <FormMessage />}
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="verse"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Verse (optional)</FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            value={field.value ? String(field.value) : undefined}
                                            placeholder={selectedChapterId ? "Entire chapter / select verse" : "Select a chapter first"}
                                            disabled={!selectedChapterId}
                                            onChange={(opt) => {
                                                field.onChange(opt?.rawValue ? Number(opt.rawValue) : null)
                                            }}
                                            ref={field.ref}
                                            options={verses.map((v) => ({
                                                label: `Verse ${v.number}`,
                                                value: String(v.id),
                                                rawValue: v.id,
                                            }))}
                                        />
                                    </FormControl>
                                    {fieldState.error && <FormMessage />}
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-full">
                                    <FormLabel>Tags (Optional)</FormLabel>
                                    <FormControl>
                                        <TagsInput
                                            classNames={{ input: "placeholder:text-slate-500" }}
                                            placeHolder="Enter tags"
                                            value={field.value ?? []}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            name={field.name}
                                        />
                                    </FormControl>
                                    {fieldState.error && <FormMessage />}
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Featured Image</FormLabel>
                                    <FormControl>
                                        <FileInput
                                            onFileChange={(value) => {
                                                field.onChange(value)
                                            }}>
                                            <div className="w-full h-80 border-2 border-dashed border-gray-500 rounded-md flex items-center justify-center">
                                                {
                                                    field.value ?
                                                        <Image
                                                            src={field.value}
                                                            width={500} height={300} alt=""
                                                            className="w-auto h-full object-contain object-center" />
                                                        :
                                                        <p className="text-center">Click here to select featured image.</p>
                                                }
                                            </div>
                                        </FileInput>
                                    </FormControl>
                                    {fieldState.error && <FormMessage />}
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="content"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-full">
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        <QuillEditor {...field} />
                                    </FormControl>
                                    {fieldState.error && <FormMessage />}
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="info"
                            render={({ fieldState }) => (
                                <FormItem className="mt-5 col-span-full">
                                    {fieldState.error && <FormMessage />}
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline"
                            type="button"
                            onClick={() => formState.isDirty ? resetFormValues() : window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!formState.isDirty || formState.isSubmitting}>
                            {
                                formState.isSubmitting ?
                                    <Spinner className="border-white" />
                                    :
                                    blog ? "Update" : "Add"
                            }
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card >
    )
}
