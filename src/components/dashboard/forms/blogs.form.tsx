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
import { useEffect, useState } from "react";
import { IBlog, IBook } from "@/shared/types/models.types";
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
})


export type BlogsFormSchema = z.infer<typeof blogsFormSchema>



export default function BlogsForm({ blog }: { blog?: IBlog }) {
    const router = useRouter()
    const [books, setBooks] = useState<IBook[] | null>(null)
    const form = useForm<BlogsFormSchema>({
        resolver: zodResolver(blogsFormSchema),
        mode: "all",
        defaultValues: {
            title: blog?.title,
            slug: blog?.slug,
            content: blog?.content,
            type: blog?.type,
            image: blog?.image,
            tags: blog?.tags?.split(",")
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
        const titleVal = form.getValues("title")
        if (!titleVal) return;
        const slug = titleVal.toLowerCase().replaceAll(" ", "_").replaceAll("/", "_")
        form.setValue("slug", slug, { shouldValidate: true })
    }



    const resetFormValues = () => {
        form.reset({
            title: undefined,
            slug: undefined,
            type: undefined,
            content: undefined
        })
    }




    const handleAddNew = async (data: BlogsFormSchema) => {
        const res = await clientApiHandlers.blogs.create(data)
        if (res.succeed && res.data) return router.push("/dashboard/blogs")
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

    const handleUpdate = async (data: BlogsFormSchema) => {
        if (!blog) return;
        const res = await clientApiHandlers.blogs.update(blog.id, data)
        if (res.succeed && res.data) return router.push("/dashboard/blogs")
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


    console.log(blog)


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
                            name="type"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Blog Type <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            value={field.value}
                                            placeholder="Select Type"
                                            onChange={(opt) => field.onChange(opt?.value)}
                                            ref={field.ref}
                                            loading={!books}
                                            options={[BlogType.MANUSCRIPT, BlogType.PROBLEM]?.map((type) => ({ label: type, value: type, rawValue: type }))}
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
                            name="tags"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-full">
                                    <FormLabel>Tags (Optional)</FormLabel>
                                    <FormControl>
                                        <TagsInput classNames={{ input: "placeholder:text-slate-500" }}
                                            placeHolder="Enter tags" {...field} />
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
                            name="image"
                            render={({ field, fieldState }) => (
                                <FormItem className="col-span-1">
                                    <FormLabel>Featured Image</FormLabel>
                                    <FormControl>
                                        <FileInput
                                            required
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
                                                        <p className="text-center">Click here to select featured image for blog.</p>
                                                }
                                            </div>
                                        </FileInput>
                                    </FormControl>
                                    {
                                        fieldState.error &&
                                        <FormMessage />
                                    }
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
                        <Button variant="outline"
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