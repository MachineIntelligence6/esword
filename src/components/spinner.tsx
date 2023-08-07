import { cn } from "@/lib/utils";



export default function Spinner({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
    return (
        <div className={cn(
            "border-slate-600 rounded-full animate-spin",
            size === "sm" ? "w-5 h-5 border-2" : "w-20 h-20 border-4",
            className,
            "!border-t-transparent"
        )}>

        </div>
    )
}
