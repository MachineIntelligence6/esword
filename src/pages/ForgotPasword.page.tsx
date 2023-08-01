import HeaderComponent from "@/components/HeaderComponent";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ForgotPaswordFormSchema, forgotPaswordFormSchema } from "@/types/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";




export default function ForgotPasswordPage() {
    const form = useForm<ForgotPaswordFormSchema>({
        resolver: zodResolver(forgotPaswordFormSchema),
        mode: "all"
    })
    const handleFormSubmit = async (data: ForgotPaswordFormSchema) => { 
        console.log(data)

    }


    return (
        <>
            {/* Header component */}
            <HeaderComponent />
            {/* Content */}
            <div className="bg-primary min-h-screen flex items-center justify-center pt-[60px] ">

                <div className="bg-white md:w-[446px] w-full md:px-0 mx-4 border rounded">
                    <div className="md:pt-8 pt-5 md:px-8 px-4">
                        <a href="/login">
                        <i className="fa-solid fa-arrow-left-long"></i>
                        </a>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <div className="rounded-full">
                            <img src="./images/email-instructions.svg" alt="" />
                        </div>
                        <div className="flex items-center justify-center text-center pt-5 pb-3">
                            <p className="text-primary-dark font-inter font-bold text-2xl">
                                Forgot your password?
                            </p>
                        </div>
                        <div className="flex items-center justify-center text-center md:px-[78px] px-8 md:pb-7 pb-5">
                            <p className="text-primary-dark font-normal text-sm ">
                                Please enter your email below and we will send you instructions to reset your password
                            </p>
                        </div>
                        <div className="items-center justify-center w-full md:px-10 px-4 pb-5">
                            <Form {...form}>
                                <form method="post" onSubmit={form.handleSubmit(handleFormSubmit)}>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold">Email <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="email" autoComplete="email" placeholder="Enter your Email here" {...field} />
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
                                    <div className="mt-5 mb-5">
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



        </>

    )
}
