'use client'
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";



export function BackButton() {
    return (
        <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="aspect-square p-1 w-auto h-auto">
            <ChevronLeftIcon className="w-8 h-8" />
        </Button>
    )
}