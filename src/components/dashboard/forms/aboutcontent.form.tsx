"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import clientApiHandlers from "@/client/handlers";
import definedMessages from "@/shared/constants/messages";
import Spinner from "@/components/spinner";
import { z } from "zod";
import QuillEditor from "@/components/ui/editor";
import { AboutContent } from "@prisma/client";

export const aboutContentFormSchema = z.object({
  info: z.string().nullable().default(""),
  title: z.string({ required_error: "This field is required." }),
  content: z.string({ required_error: "This field is required." }),
});

export type AboutContentFormSchema = z.infer<typeof aboutContentFormSchema>;

type Props = { aboutContent?: AboutContent | null };

export default function AboutContentForm({ aboutContent }: Props) {
  const form = useForm<AboutContentFormSchema>({
    resolver: zodResolver(aboutContentFormSchema),
    mode: "all",
    defaultValues: {
      title: aboutContent?.title,
      content: aboutContent?.content,
    },
  });
  const { formState } = form;

  const resetFormValues = () => {
    form.reset({
      title: aboutContent?.title,
      content: aboutContent?.title,
    });
  };

  const handleUpdate = async (data: AboutContentFormSchema) => {
    const res = await clientApiHandlers.settings.saveAboutContent(data);
    if (res.succeed) window.location.reload();
    if (res.code === "UNKOWN_ERROR") {
      form.setError("info", {
        message: definedMessages.UNKNOWN_ERROR,
      });
    }
  };

  return (
    <Card className="w-full rounded-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleUpdate)}>
          <CardContent className="gap-5 pt-5 grid grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem className="col-span-full">
                  <FormLabel>
                    Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input required {...field} />
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
                  <FormLabel>
                    Content <span className="text-red-500">*</span>
                  </FormLabel>
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
                  {fieldState.error && <FormMessage />}
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              disabled={!formState.isDirty || formState.isSubmitting}
              onClick={resetFormValues}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formState.isDirty || formState.isSubmitting}
            >
              {formState.isSubmitting ? (
                <Spinner className="border-white" />
              ) : (
                "Save"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
