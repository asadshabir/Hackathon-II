import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-0 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 px-4 py-2 text-base text-slate-900 dark:text-slate-100 input-neu transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900 dark:file:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:shadow-neuHover focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
