'use client'
import { ArrowLeftIcon, ExitIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "./ui/dropdown-menu";



export function BackButton() {
    return (
        <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="aspect-square p-1 w-auto h-auto rounded-full">
            <ArrowLeftIcon className="w-8 h-8" />
        </Button>
    )
}

export function LogoutButton() {
    return (
        <DropdownMenuItem className="flex items-center justify-between" onClick={() => signOut({ redirect: true })}>
            <span>Log Out</span>
            <ExitIcon className="w-4 h-4" />
        </DropdownMenuItem>
    )
}