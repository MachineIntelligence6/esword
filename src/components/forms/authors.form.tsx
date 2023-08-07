'use client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import apiClientActions from "@/client/actions";
import definedMessages from "@/shared/constants/messages";
import { Author, Book } from "@prisma/client";
import Spinner from "@/components/spinner";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { z } from 'zod'
import { Textarea } from "../ui/textarea";


export const authorFormSchema = z.object({
    info: z.string().nullable().default(""),
    name: z.string({ required_error: "This field is required." }),
    description: z.string({ required_error: "This field is required." }),
})


export type AuthorFormSchema = z.infer<typeof authorFormSchema>



type Props = {
    author?: Author | null;
    onReset?: () => void;
}


export default function AuthorsForm({ author, onReset }: Props) {
    const form = useForm<AuthorFormSchema>({
        resolver: zodResolver(authorFormSchema),
        mode: "all"
    })
    const { toast } = useToast()
    const { formState } = form



    useEffect(() => {
        if (!author) return;
        form.reset({
            name: author.name,
            description: author.description
        })
    }, [author, form])


    const resetFormValues = () => {
        form.reset({
            name: "",
            description: ""
        })
    }


    const resetForm = () => {
        if (author && onReset) onReset()
        resetFormValues()
    }


    const handleAddNew = async (data: AuthorFormSchema) => {
        const res = await apiClientActions.authors.create(data)
        if (res.succeed && res.data) {
            return window.location.reload()
            // return toast({
            //     title: "New Author Added",
            //     description: definedMessages.AUTHOR_ADDED
            // })
        }
        if (res.code === "UNKOWN_ERROR") {
            form.setError("info", {
                message: definedMessages.UNKNOWN_ERROR
            })
        }
    }


    const handleUpdate = async (data: AuthorFormSchema) => {
        if (!author) return;
        const res = await apiClientActions.authors.update(author.id, data)
        if (res.succeed && res.data) {
            return window.location.reload()
            // return toast({
            //     title: "Author Info Updated",
            //     description: definedMessages.AUTHOR_UPDATED
            // })
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
                    onSubmit={form.handleSubmit(author ? handleUpdate : handleAddNew)}>
                    <CardHeader>
                        <CardTitle>
                            {author ? "Update Author" : "Add New Author"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input type="text"{...field} />
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
                            name="description"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea rows={3} {...field} />
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
                            formState.isDirty || author ?
                                <Button variant="outline" onClick={resetForm}>Cancel</Button>
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
                                    author ? "Update" : "Add"
                            }
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card >
    )
}