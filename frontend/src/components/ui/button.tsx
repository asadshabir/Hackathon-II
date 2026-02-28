import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium btn-press transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-neu hover:shadow-neuHover active:shadow-neuInner active:transform active:translate-y-px",
        destructive:
          "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-neu hover:shadow-neuHover active:shadow-neuInner active:transform active:translate-y-px",
        outline:
          "border-2 border-indigo-600 text-indigo-600 bg-gradient-to-br from-white to-slate-100 shadow-neu hover:shadow-neuHover active:shadow-neuInner active:transform active:translate-y-px",
        secondary:
          "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 dark:from-slate-700 dark:to-slate-800 dark:text-slate-100 shadow-neu hover:shadow-neuHover active:shadow-neuInner active:transform active:translate-y-px",
        ghost:
          "text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-neuHover active:shadow-neuInner",
        link: "text-indigo-600 dark:text-indigo-400 underline-offset-4 hover:underline bg-transparent hover:shadow-neuHover active:shadow-neuInner",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
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
