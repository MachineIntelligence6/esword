import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/** Elisen `ui/Badge.tsx` — tags always use 4px radius (`rounded-xs`).
 *  Rendered as <span> so it can sit safely inside paragraphs/buttons. */
const badgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-xs text-xs transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-700 font-medium px-2 py-0.5",
        secondary: "bg-slate-100 text-slate-700 font-medium px-2 py-0.5",
        destructive: "bg-danger-subtle text-danger font-medium px-2 py-0.5",
        outline: "border border-slate-200 bg-white text-slate-700 font-medium px-2 py-0.5",
        success: "bg-success-subtle text-success font-medium px-2 py-0.5",
        warning: "bg-warning-subtle text-warning font-medium px-2 py-0.5",
        info: "bg-info-subtle text-info font-medium px-2 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
