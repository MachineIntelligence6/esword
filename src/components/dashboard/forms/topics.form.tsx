'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import clientApiHandlers from "@/client/handlers";
import definedMessages from "@/shared/constants/messages";
import Spinner from "@/components/spinner";
import { useEffect, useState } from "react";
import { z } from 'zod'
import { IBook, IChapter, ITopic } from "@/shared/types/models.types";
import { SelectEl } from "../../ui/select";


export const topicFormSchema = z.object({
    info: z.string().nullable().default(""),
    name: z.string({ required_error: "This field is required." }).min(1, { message: "This field is required." }),
    number: z.number({ required_error: "This field is required." }),
    book: z.number({ required_error: "This field is required." }),
    chapter: z.number({ required_error: "This field is required." }),
})


export type TopicFormSchema = z.infer<typeof topicFormSchema>



type FormProps = {
    onReset?: () => void;
    topic: ITopic
}


export function AddTopicForm() {
    const form = useForm<TopicFormSchema>({
        resolver: zodResolver(topicFormSchema),
        mode: "all"
    })



    const resetFormValues = () => {
        form.reset({
            name: "",
            number: undefined,
            book: undefined,
            chapter: undefined,
        })
    }


    const handleAddNew = async (data: TopicFormSchema) => {
        const res = await clientApiHandlers.topics.create(data)
        if (res.succeed && res.data) {
            return window.location.reload()
        }
        if (res.code === "TOPIC_NUMBER_MUST_BE_UNIQUE") {
            form.setError("number", {
                message: definedMessages.TOPIC_NUMBER_MUST_BE_UNIQUE
            })
        }
        if (res.code === "UNKOWN_ERROR") {
            form.setError("info", {
                message: definedMessages.UNKNOWN_ERROR
            })
        }
    }


    return (
        <FormView
            form={form}
            onFormSubmit={handleAddNew}
            resetForm={resetFormValues}
            variant="ADD" />
    )
}


export function EditTopicForm({ topic, onReset }: FormProps) {
    const form = useForm<TopicFormSchema>({
        resolver: zodResolver(topicFormSchema),
        mode: "all",
        defaultValues: {
            name: topic.name,
            number: topic.number,
            book: topic.chapter?.bookId,
            chapter: topic.chapterId
        }
    })


    const resetFormValues = () => {
        form.reset({
            name: "",
            number: undefined,
            book: undefined,
            chapter: undefined,
        })
    }


    const resetForm = () => {
        if (onReset) onReset()
        resetFormValues()
    }


    const handleUpdate = async (data: TopicFormSchema) => {
        if (!topic) return;
        const res = await clientApiHandlers.topics.update(topic.id, data)
        if (res.succeed && res.data) {
            return window.location.reload()
        }
        if (res.code === "TOPIC_NUMBER_MUST_BE_UNIQUE") {
            form.setError("number", {
                message: definedMessages.TOPIC_NUMBER_MUST_BE_UNIQUE
            })
        }
        if (res.code === "UNKOWN_ERROR") {
            form.setError("info", {
                message: definedMessages.UNKNOWN_ERROR
            })
        }
    }




    return (
        <FormView
            form={form}
            onFormSubmit={handleUpdate}
            resetForm={resetForm}
            variant="UPDATE" />
    )
}


type FormViewProps = {
    form: UseFormReturn<TopicFormSchema>;
    onFormSubmit: (data: TopicFormSchema) => Promise<void>;
    resetForm: () => void;
    variant: "ADD" | "UPDATE"
}


function FormView({ form, onFormSubmit, variant, resetForm }: FormViewProps) {
    const [books, setBooks] = useState<IBook[] | null>(null)
    const [chapters, setChapters] = useState<IChapter[] | null>(null)
    const { formState } = form;


    useEffect(() => {
        clientApiHandlers.books.get({
            page: 1, perPage: -1, include: {
                chapters: { where: { archived: false } }
            }
        })
            .then((res) => {
                setBooks(res.data ?? [])
            })
    }, [])

    useEffect(() => {
        const getChaptersList = () => {
            const bookId = form.getValues("book")
            if (!bookId) return null
            const book: IBook | undefined = books?.find((b) => b.id === bookId);
            return book?.chapters ?? null
        }
        setChapters(getChaptersList())
    }, [books, form, formState])

    return (
        <Card className="w-full rounded-md">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onFormSubmit)}>
                    <CardHeader>
                        <CardTitle>
                            {variant === "ADD" ? "Add New Topic" : "Update Topic"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <FormItem>
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
                            name="number"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Number <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" required {...field}
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
                            name="book"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Book <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <SelectEl
                                            value={field.value?.toString()}
                                            placeholder="Select Book"
                                            onChange={(opt) => {
                                                field.onChange(opt && Number(opt.value))
                                                form.resetField("chapter")
                                            }}
                                            loading={!books}
                                            options={books?.map((book) => ({
                                                label: book.name,
                                                value: book.id.toString(),
                                                rawValue: book
                                            }))}
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
                                            value={field.value?.toString()}
                                            placeholder="Select Chapter"
                                            disabled={!chapters}
                                            loading={!books}
                                            onChange={(opt) => {
                                                field.onChange(opt && Number(opt.value))
                                            }}
                                            options={chapters?.map((chapter) => ({
                                                label: String(chapter.name),
                                                value: chapter.id.toString(),
                                                rawValue: chapter
                                            }))}
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
                        {
                            formState.isDirty || variant === "UPDATE" ?
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
                                    variant === "ADD" ? "Add" : "Update"
                            }
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card >
    )
}





// export default function TopicsForm({ topic, onReset }: FormProps) {
//     const form = useForm<TopicFormSchema>({
//         resolver: zodResolver(topicFormSchema),
//         mode: "all"
//     })
//     const [books, setBooks] = useState<IBook[] | null>(null)
//     const [chapters, setChapters] = useState<IChapter[] | null>(null)
//     const { formState } = form



//     useEffect(() => {
//         clientApiHandlers.books.get({
//             page: 1, perPage: -1, include: {
//                 chapters: { where: { archived: false } }
//             }
//         })
//             .then((res) => {
//                 setBooks(res.data ?? [])
//             })
//     }, [])


//     useEffect(() => {
//         console.log(" i am called")
//         if (!topic) return;
//         form.reset({
//             name: topic.name,
//             number: topic.number,
//             book: topic.chapter?.bookId,
//             chapter: topic.chapterId
//         })
//         form.setValue("chapter", topic.chapterId)
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [topic])


//     const resetFormValues = () => {
//         form.reset({
//             name: "",
//             number: undefined,
//             book: undefined,
//             chapter: undefined,
//         })
//     }


//     const resetForm = () => {
//         if (topic && onReset) onReset()
//         resetFormValues()
//     }


//     const handleAddNew = async (data: TopicFormSchema) => {
//         const res = await clientApiHandlers.topics.create(data)
//         if (res.succeed && res.data) {
//             return window.location.reload()
//         }
//         if (res.code === "TOPIC_NUMBER_MUST_BE_UNIQUE") {
//             form.setError("number", {
//                 message: definedMessages.TOPIC_NUMBER_MUST_BE_UNIQUE
//             })
//         }
//         if (res.code === "UNKOWN_ERROR") {
//             form.setError("info", {
//                 message: definedMessages.UNKNOWN_ERROR
//             })
//         }
//     }


//     const handleUpdate = async (data: TopicFormSchema) => {
//         if (!topic) return;
//         const res = await clientApiHandlers.topics.update(topic.id, data)
//         if (res.succeed && res.data) {
//             return window.location.reload()
//         }
//         if (res.code === "TOPIC_NUMBER_MUST_BE_UNIQUE") {
//             form.setError("number", {
//                 message: definedMessages.TOPIC_NUMBER_MUST_BE_UNIQUE
//             })
//         }
//         if (res.code === "UNKOWN_ERROR") {
//             form.setError("info", {
//                 message: definedMessages.UNKNOWN_ERROR
//             })
//         }
//     }


//     useEffect(() => {
//         const getChaptersList = () => {
//             const bookId = form.getValues("book")
//             if (!bookId) return null
//             const book: IBook | undefined = books?.find((b) => b.id === bookId);
//             return book?.chapters ?? null
//         }
//         setChapters(getChaptersList())
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [topic, formState])


//     return (
//         <Card className="w-full rounded-md">
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(topic ? handleUpdate : handleAddNew)}>
//                     <CardHeader>
//                         <CardTitle>
//                             {topic ? "Update Topic" : "Add New Topic"}
//                         </CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         <FormField
//                             control={form.control}
//                             name="name"
//                             render={({ field, fieldState }) => (
//                                 <FormItem>
//                                     <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
//                                     <FormControl>
//                                         <Input type="text" required {...field} />
//                                     </FormControl>
//                                     {
//                                         fieldState.error &&
//                                         <FormMessage />
//                                     }
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             control={form.control}
//                             name="number"
//                             render={({ field, fieldState }) => (
//                                 <FormItem>
//                                     <FormLabel>Number <span className="text-red-500">*</span></FormLabel>
//                                     <FormControl>
//                                         <Input type="number" required {...field}
//                                             onChange={(e) => field.onChange(e.target.valueAsNumber)} />
//                                     </FormControl>
//                                     {
//                                         fieldState.error &&
//                                         <FormMessage />
//                                     }
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             control={form.control}
//                             name="book"
//                             render={({ field, fieldState }) => (
//                                 <FormItem>
//                                     <FormLabel>Book <span className="text-red-500">*</span></FormLabel>
//                                     <FormControl>
//                                         <SelectEl
//                                             value={field.value?.toString()}
//                                             placeholder="Select Book"
//                                             onChange={(opt) => {
//                                                 field.onChange(opt && Number(opt.value))
//                                             }}
//                                             loading={!books}
//                                             options={books?.map((book) => ({
//                                                 label: book.name,
//                                                 value: book.id.toString(),
//                                                 rawValue: book
//                                             }))}
//                                         />
//                                     </FormControl>
//                                     {
//                                         fieldState.error &&
//                                         <FormMessage />
//                                     }
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             control={form.control}
//                             name="chapter"
//                             render={({ field, fieldState }) => (
//                                 <FormItem>
//                                     <FormLabel>Chapter <span className="text-red-500">*</span></FormLabel>
//                                     <FormControl>
//                                         <SelectEl
//                                             value={field.value?.toString()}
//                                             placeholder="Select Chapter"
//                                             disabled={!chapters}
//                                             loading={!books}
//                                             onChange={(opt) => {
//                                                 field.onChange(opt && Number(opt.value))
//                                             }}
//                                             options={chapters?.map((chapter) => ({
//                                                 label: String(chapter.name),
//                                                 value: chapter.id.toString(),
//                                                 rawValue: chapter
//                                             }))}
//                                         />
//                                     </FormControl>
//                                     {
//                                         fieldState.error &&
//                                         <FormMessage />
//                                     }
//                                 </FormItem>
//                             )}
//                         />
//                         <FormField
//                             control={form.control}
//                             name="info"
//                             render={({ fieldState }) => (
//                                 <FormItem className="mt-5">
//                                     {
//                                         fieldState.error &&
//                                         <FormMessage />
//                                     }
//                                 </FormItem>
//                             )}
//                         />
//                     </CardContent>
//                     <CardFooter className="flex justify-between">
//                         {
//                             formState.isDirty || topic ?
//                                 <Button variant="outline" type="button" onClick={resetForm}>Cancel</Button>
//                                 :
//                                 <span></span>
//                         }
//                         <Button
//                             type="submit"
//                             disabled={!formState.isDirty || formState.isSubmitting}>
//                             {
//                                 formState.isSubmitting ?
//                                     <Spinner className="border-white" />
//                                     :
//                                     topic ? "Update" : "Add"
//                             }
//                         </Button>
//                     </CardFooter>
//                 </form>
//             </Form>
//         </Card >
//     )
// }