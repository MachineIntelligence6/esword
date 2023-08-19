'use client'
import Image from "next/image";
import { UserDropdownMenu } from "./user-dropmenu";
import Link from "next/link";
import { Session } from "next-auth";


type Props = {
    session?: Session | null
}

export default function DashboardHeader({ session }: Props) {
    return (
        <header className="sticky top-0 z-50 shadow">
            <nav className="flex justify-between px-6 items-center h-[80px] w-full bg-primary">
                <div>
                    <Link href="/home">
                        <Image width={250} height={100} alt="" src="/images/logo.png" className="object-contain bg-cover h-auto w-[250px]" />
                    </Link>
                </div>
                <div>
                    {session && <UserDropdownMenu session={session} />}
                </div>
            </nav>
        </header>
    );
}

