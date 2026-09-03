import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Visual language aligned with Elisen `ui/Button.tsx` (DESIGN.md / COMPONENTS.md).
 *  Brand fill uses eSword primary blue instead of Elisen navy. */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap select-none rounded-sm text-sm font-semibold transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:pointer-events-none disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        // Elisen primary → brand blue
        default:
          "border border-primary bg-primary text-white hover:bg-primary-dark hover:border-primary-dark active:bg-primary-800 active:border-primary-800 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500",
        primary:
          "border border-primary bg-primary text-white hover:bg-primary-dark hover:border-primary-dark disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500",
        // Elisen secondary
        outline:
          "border border-slate-400 bg-transparent text-slate-950 hover:border-slate-950 active:bg-accent-subtle disabled:border-slate-200 disabled:text-slate-300",
        "primary-outline":
          "border border-slate-400 bg-transparent text-slate-950 hover:border-primary hover:text-primary active:bg-accent-subtle",
        // Quiet surface control (icon buttons, menus) — not underlined tertiary text
        ghost:
          "border border-transparent bg-transparent text-slate-950 hover:bg-slate-100 disabled:text-slate-300",
        link:
          "border border-transparent bg-transparent text-slate-950 underline-offset-2 hover:text-primary hover:underline disabled:text-slate-300",
        secondary:
          "border border-transparent bg-slate-100 text-slate-950 hover:bg-slate-200 disabled:text-slate-300",
        // Elisen danger
        destructive:
          "border border-danger bg-danger text-white hover:bg-danger-hover hover:border-danger-hover active:bg-danger-active active:border-danger-active disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500",
      },
      size: {
        default: "h-9 px-3 gap-1",
        sm: "h-8 px-3 gap-1 text-xs",
        xs: "h-7 px-2 gap-1 text-xs",
        lg: "h-11 px-4 gap-2",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        type={asChild ? type : type ?? "button"}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
