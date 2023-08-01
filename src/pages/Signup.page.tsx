import HeaderComponent from "@/components/HeaderComponent";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SignUpFormSchema, signUpFormSchema } from "@/types/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";




export default function SignUpPage() {
    const form = useForm<SignUpFormSchema>({
        resolver: zodResolver(signUpFormSchema),
        mode: "all"
    })
    const handleFormSubmit = async (data: SignUpFormSchema) => {
        console.log(data)

     }


    return (
        <>
            {/* Header Componet */}
            <HeaderComponent />
            {/* Content */}
            <div className="bg-primary min-h-screen flex items-center justify-center  pt-16">
                <div className="mt-14">
                    <div
                        className="md:w-[446px] w-auto md h-auto flex flex-col items-center justify-center bg-white mx-4 md:mx-0  rounded-lg overflow-y-auto overflow-hidden ">
                        <div className="">
                            <p className="font-inter font-bold text-2xl text-primary-dark pt-10">
                                Sign up with
                            </p>
                        </div>
                        <div className="flex justify-center  flex-col w-full py-3 mt-5">
                            <div className="md:px-10 px-4">
                                <div className="">
                                    <Form {...form}>
                                        <form method="post" onSubmit={form.handleSubmit(handleFormSubmit)}>
                                            <div className="flex justify-between gap-1 py-2 ">
                                                <FormField
                                                    control={form.control}
                                                    name="firstname"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-semibold">
                                                                First Name <span className="text-red-500">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input type="firstname" autoComplete="firstname" placeholder="Enter here" {...field} />
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
                                                    name="lastname"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-semibold">
                                                                Last Name <span className="text-red-500">*</span>
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input type="lastname" autoComplete="lastname" placeholder="Enter here" {...field} />
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
                                            <div className="space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-semibold">
                                                                Email <span className="text-red-500">*</span>
                                                            </FormLabel>
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
                                                                Retype Password<span className="text-red-500">*</span>
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
                                                    Sign up
                                                </Button>
                                            </div>
                                        </form>

                                    </Form>
                                </div>

                                <div
                                    className="flex justify-center items-center font-normal text-base text-primary-dark md:pt-3 md:pb-8 pb-5 pt-0 px-1 gap-2">
                                    <p> Already have an account? </p>
                                    <a className="font-bold" href="/login">Login here</a>
                                </div>
                            </div>

                        </div>

                    </div>
                    <div
                        className="flex font-normal text-xs text-center text-white justify-center items-center pt-4 pb-9 md:w-[446px] w-auto px-16 md:text-sm">
                        By creating an account, you agree to our terms of service and privacy policy
                    </div>
                </div>

            </div>



        </>

    )
}
