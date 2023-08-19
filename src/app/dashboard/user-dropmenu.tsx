import { LogoutButton } from "@/components/dashboard/buttons"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Spinner from "@/components/spinner"
import { PersonIcon } from "@radix-ui/react-icons"
import { Session } from "next-auth"


type Props = {
    session: Session
}

export function UserDropdownMenu({ session }: Props) {
    // const { data: session, status } = useSession({ required: true })
    // if (status === "loading") return <Spinner className="w-8 border-white" />;
    // if (!session) return null;
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