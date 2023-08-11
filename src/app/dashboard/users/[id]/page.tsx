import { BackButton } from "@/components/dashboard/buttons";
import serverApiHandlers from "@/server/handlers";
import { notFound } from "next/navigation";
import CommentariesTable from "@/components/dashboard/tables/commentaries.table";
import Link from "next/link";
import { buttonVariants } from "@/components/dashboard/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import NotesTable from "@/components/dashboard/tables/notes.table";


export default async function Page({ params }: { params: { id: string } }) {
    const { data: user } = await serverApiHandlers.users.getById(parseInt(params.id))
    if (!user) return notFound()

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-5 justify-between">
                <div className="flex items-start gap-5">
                    <BackButton />
                    <div className="max-w-screen-xl">
                        <h1 className="font-semibold text-2xl">
                            {user?.name}
                        </h1>
                        <p className="mt-3">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={parseInt(params.id) > 1 ? `/dashboard/users/${parseInt(params.id) - 1}` : '#'}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full"
                        )}>
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                    <Link
                        href={`/dashboard/users/${parseInt(params.id) + 1}`}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            "aspect-square p-1 w-auto h-auto rounded-full"
                        )}>
                        <ChevronRightIcon className="w-6 h-6" />
                    </Link>
                </div>
            </div>
            <div className="pt-5">
                <h3 className="font-semibold text-2xl mb-5">Notes</h3>
                <NotesTable user={user} />
            </div>
        </div>
    )
}
