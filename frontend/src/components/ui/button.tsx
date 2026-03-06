import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_4px_16px_rgba(99,102,241,0.25)] hover:shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_4px_24px_rgba(99,102,241,0.35)] hover:brightness-110",
        destructive:
          "bg-gradient-to-br from-rose-600 to-rose-500 text-white shadow-[0_0_0_1px_rgba(239,68,68,0.3),0_4px_16px_rgba(239,68,68,0.2)] hover:brightness-110",
        outline:
          "border border-indigo-500/40 text-indigo-400 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.12] hover:border-indigo-500/60",
        secondary:
          "bg-[#181B23] border border-white/[0.08] text-white/80 hover:bg-[#1F2330] hover:text-white hover:border-white/[0.12]",
        ghost:
          "text-white/60 bg-transparent hover:bg-white/[0.05] hover:text-white",
        link: "text-indigo-400 underline-offset-4 hover:underline bg-transparent hover:text-indigo-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
