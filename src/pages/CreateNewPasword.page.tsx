import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreatePaswordFormSchema, createPaswordFormSchema } from "@/types/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";




export default function CreateNewPasword() {
    const form = useForm<CreatePaswordFormSchema>({
        resolver: zodResolver(createPaswordFormSchema),
    })
    const handleFormSubmit = async (data: CreatePaswordFormSchema) => { 
        console.log(data)

    }


    return (
        <>



            <header className="flex justify-between lg:px-0  items-center h-[60px] fixed top-0 left-0 bg-primary w-full z-50">
                <div className="lg:px-2 px-3">
                    <a href="">
                        <img src="/images/Hidden Sword Logo Enlarged.png" className="object-contain bg-cover w-[250px]" />
                    </a>
                </div>
                <div>

                </div>
            </header>
            <div className="bg-primary min-h-screen flex items-center justify-center border">
                <div className="">
                    <div
                        className="md:w-[446px] w-auto md h-auto flex flex-col items-center justify-center bg-white mx-4 md:mx-0 pt-10 rounded-lg relative">
                        <div className=" pb-5 px-8 md:px-0 md:pb-10">
                            <p className="font-inter font-bold text-2xl text-primary-dark">
                                Create new password
                            </p>
                        </div>
                        <div className="flex justify-center  flex-col w-full pb-8">
                            <div className="md:px-10 px-4">
                                <div className="">
                                    <Form {...form}>
                                        <form method="post" onSubmit={form.handleSubmit(handleFormSubmit)}>

                                            <div className="space-y-3">

                                                <FormField
                                                    control={form.control}
                                                    name="password"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-semibold">
                                                                Password <span className="text-red-500">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input type="password" autoComplete="password" placeholder="Enter your Password here" {...field} />
                                                            </FormControl>
                                                            {
                                                                fieldState.error && (
                                                                    <FormMessage>
                                                                        {fieldState.error?.message}
                                                                    </FormMessage>
                                                                )
                                                            }
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="confirmPassword"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-semibold">
                                                                Retype Password <span className="text-red-500">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input type="confirmPassword" autoComplete="confirmPassword" placeholder="Enter your Password again" {...field} />
                                                            </FormControl>
                                                            {
                                                                fieldState.error && (
                                                                    <FormMessage>
                                                                        {fieldState.error?.message}
                                                                    </FormMessage>
                                                                )
                                                            }
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="md:mt-8 mt-5 mb-5">
                                                <Button type="submit">
                                                    Submit
                                                </Button>
                                            </div>
                                        </form>

                                    </Form>
                                </div>


                            </div>

                        </div>

                    </div>

                </div>

            </div>


        </>

    )
}
