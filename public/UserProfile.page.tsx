import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectEl } from "@/components/ui/select";
import { useForm } from "react-hook-form";




export default function UserProfilePage() {
    const form = useForm();
    return (
        <div className="w-full relative bg-dark p-10 pr-0 pt-8 pb-5">
            <div className="flex items-center gap-7">
                <button className="w-11 h-auto aspect-square shadow-back-btn rounded-2xl text-primary-accent">
                    <p className="text-3xl">
                        &lt;
                    </p>
                </button>
                <div>
                    <img src="/images/user.png" width={50} height={50}
                        className="w-12 h-auto aspect-square object-contain object-center" alt="" />
                </div>
                <div>
                    <p className="text-xl font-medium opacity-60">
                        User Profile
                    </p>
                </div>
            </div>
            {/* left section for user information */}
            <div className="flex h-full min-h-screen ">
                <div className="w-[55%] h-full p-11 pr-0 z-[1]">
                    <div className="mt-8">

                        <Form {...form}>
                            {/* user profile form */}

                            <form name="userprofileform" action="#">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={() => (
                                            <FormItem className="col-span-1">
                                                <FormLabel className="ms-4 font-light">Username</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Your Username" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="relative w-[106px] pt-8">
                                        <div className="">
                                            <img src="/icons/upwardarrow.png"
                                                className="p-10  shadow-input rounded-full" alt="" />
                                        </div>
                                        <div className="absolute bottom-0 right-0">
                                            <img src="/icons/delete.png"
                                                className="p-2 shadow-input rounded-full" alt="" />
                                        </div>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={() => (
                                            <FormItem className="col-span-full">
                                                <FormLabel className="ms-4 font-light">Title</FormLabel>
                                                <FormControl>
                                                    <SelectEl placeholder="Select Title" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={() => (
                                            <FormItem className="col-span-1">
                                                <FormLabel className="ms-4 font-light">First Name</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Your First Name" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={() => (
                                            <FormItem className="col-span-1">
                                                <FormLabel className="ms-4 font-light">Last Name</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Your Last Name" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="companyName"
                                        render={() => (
                                            <FormItem className="col-span-1">
                                                <FormLabel className="ms-4 font-light">Company</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Company Name" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="position"
                                        render={() => (
                                            <FormItem className="col-span-1">
                                                <FormLabel className="ms-4 font-light">Position</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Position in Company" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="companyIndustry"
                                        render={() => (
                                            <FormItem className="col-span-full">
                                                <FormLabel className="ms-4 font-light">Company Industry</FormLabel>
                                                <FormControl>
                                                    <SelectEl placeholder="Select Industry" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="mt-7 text-center">
                                    <Button variant="primary" size="xl" className="w-full">
                                        Save
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                    <div className="mt-10">
                        <Form {...form}>
                            {/* Reset Password Form */}
                            <form name="userprofileform" action="#">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                                    <FormField
                                        control={form.control}
                                        name="oldpassword"
                                        render={() => (
                                            <FormItem className="col-span-full">
                                                <FormLabel className="ms-4 font-light">Old Password</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Type Your Old Password" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="newpassword"
                                        render={() => (
                                            <FormItem className="col-span-full">
                                                <FormLabel className="ms-4 font-light">New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Type Your New Password" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="newpassword"
                                        render={() => (
                                            <FormItem className="col-span-full">
                                                <FormLabel className="ms-4 font-light"></FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Retype Your New Password" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />


                                </div>
                                <div className="mt-7 text-center">
                                    <Button variant="primary" size="xl" className="w-full">
                                        Change
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
                {/* Right section for image */}
                <div className="w-[45%] flex items-center justify-center z-[1]">
                    <img src="/images/userprofile.png"
                        className="w-full object-contain object-center"
                        alt="" />
                </div>
            </div>
        </div>
    )
}

