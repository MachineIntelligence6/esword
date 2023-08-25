'use client'
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogoutButton } from "@/components/dashboard/buttons"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDownIcon, MagnifyingGlassIcon, PersonIcon } from "@radix-ui/react-icons"
import { Session } from "next-auth";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";



type Props = {
    session: Session | null
}

export default function SiteHeader({ session }: Props) {
    const pathname = usePathname()
    // if (pathname.startsWith("/dashboard")) return null
    return (
        <header className="fixed left-0 top-0 z-50 shadow w-full">
            <nav className="flex justify-between px-6 items-center h-[70px] w-full bg-primary">
                <div>
                    <Link href="/">
                        <Image width={250} height={100} alt="" src="/images/logo.png" className="object-contain bg-cover h-auto w-[250px]" />
                    </Link>
                </div>
                <div className="flex items-center gap-x-6">
                    {
                        !pathname.startsWith("/dashboard") &&
                        <div className="flex text-white lg:gap-x-11 md:gap-x-6 md:px-3 px-5 gap-x-1 text-sm">
                            <div className="flex lg:gap-x-0">
                                {/* use of dropdown function */}
                                <Dropdown />
                            </div>
                            <div>
                                <div className="font-normal py-3 lg:block hidden">
                                    <Link href="/donate">Donate</Link>
                                </div>
                            </div>
                            <SearchComponent />
                        </div>
                    }
                    <div>
                        {session && <UserDropdownMenu session={session} />}
                    </div>
                </div>
            </nav>
        </header>
    );
}




const searchFormSchema = z.object({
    query: z.string()
})
type SearchFormSchema = z.infer<typeof searchFormSchema>

function SearchComponent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const form = useForm<SearchFormSchema>({
        mode: "all",
        resolver: zodResolver(searchFormSchema),
        defaultValues: {
            query: searchParams.get("q") ?? ""
        }
    })

    const handleFormSubmit = ({ query }: SearchFormSchema) => {
        router.push(`/search?q=${query}`)
    }

    return (
        <div className="flex gap-x-3 lg:border rounded-[42px] border-white border-opacity-70 items-center">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                    <FormField
                        control={form.control}
                        name="query"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <div className="flex items-center gap-3 px-3">
                                    <MagnifyingGlassIcon className="w-5 h-5" />
                                    <input
                                        {...field}
                                        type="text"
                                        className="bg-transparent outline-none border-none py-2 autofill-text-white" />
                                </div>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    )
}




function Dropdown() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="font-bold flex gap-1  items-center py-3">
                    <Link href="/">Home</Link>
                    <ChevronDownIcon className="h-4 w-4 shrink-0 text-white transition-transform lg:hidden" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="lg:hidden ">
                <DropdownMenuItem>
                    <a href="/" className="text-black hover:bg-primary/30 hover:text-primary-dark hover:font-bold">
                        Home
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <a href="/donate" className="text-black">
                        Donation
                    </a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    )
}



export function UserDropdownMenu({ session }: { session: Session }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='outline' className="h-auto p-2 aspect-square rounded-full">
                    <PersonIcon className="w-6 h-6 text-primary-dark" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" className="w-56">
                <DropdownMenuLabel>
                    <span className="block">{session?.user.name}</span>
                    <span className="block text-sm font-normal">{session?.user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <LogoutButton />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}