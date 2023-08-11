'use client'
import { Button } from "@/components/dashboard/ui/button";
import Image from "next/image";
import { UserDropdownMenu } from "./user-dropmenu";


export default function DashboardHeader() {
    return (
        <header className="sticky top-0 z-50">
            <nav className="flex justify-between px-6 items-center h-[80px] w-full bg-primary">
                <div>
                    <a href="/home">
                        <Image width={250} height={100} alt="" src="/images/logo.png" className="object-contain bg-cover h-auto w-[250px]" />
                    </a>
                </div>
                <div>
                    <UserDropdownMenu />
                </div>
            </nav>
        </header>
    );
}

