import HeaderComponent from "@/components/HeaderComponent";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginFormSchema, loginFormSchema } from "@/types/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";




export default function LoginPage() {
    const form = useForm<LoginFormSchema>({
        resolver: zodResolver(loginFormSchema),
        mode: "all"
    })
    const handleFormSubmit = async (data: LoginFormSchema) => {
        console.log(data)

     }


    return (
        <div className="overflow-hidden overflow-y-auto">
            {/* Header component */}
            <HeaderComponent />
            {/* Content */}
            <div className="bg-primary min-h-screen flex items-center justify-center  pt-5">
                <div className="">
                    <div
                        className="md:w-[446px] w-auto md h-auto flex flex-col items-center justify-center bg-white mx-4 md:mx-0 pt-10 rounded-lg">
                        <div>
                            <p className="font-inter font-bold text-2xl text-primary-dark">
                                Login with
                            </p>
                        </div>
                        <div className="flex justify-center  flex-col w-full py-3">
                            <div className="md:px-10 px-4">
                                <div className="">
                                    <Form {...form}>
                                        <form method="post" onSubmit={form.handleSubmit(handleFormSubmit)}>
                                            <div className="space-y-2">
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
                                                <FormField
                                                    control={form.control}
                                                    name="password"
                                                    render={({ field, fieldState }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-semibold">Password <span className="text-red-500">*</span> </FormLabel>
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
                                            </div>

                                            <div className="flex justify-between py-2 items-center text-xs md:text-sm">
                                                {/* check box properties need to set */}
                                                <div className="flex gap-1">
                                                    <Checkbox>
                                                    </Checkbox>
                                                    <p className=" text-primary-dark font-semibold font-inter">
                                                        <span>Remember me</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <a className="text-primary-dark font-semibold font-inter" href="/forgotpassowrd">
                                                        Forgot Password?
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="md:mt-8 mt-5 mb-5">
                                                <Button type="submit">
                                                    Login
                                                </Button>
                                            </div>
                                        </form>

                                    </Form>
                                </div>

                                <div
                                    className="flex gap-2 justify-center items-center font-normal text-sm  text-primary-dark md:pt-3 md:text-base  md:pb-8 pb-5 pt-0 px-1">
                                    <p>Don’t have an account?</p>
                                    <a className="font-bold" href="/signup">Sign up here</a>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>



        </div>
    )
}
