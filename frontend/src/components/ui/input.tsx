import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl px-4 py-2 text-sm transition-colors duration-150",
          "bg-[#181B23] border border-white/[0.08] text-white placeholder:text-white/30",
          "focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "light:bg-white light:border-slate-200 light:text-slate-900 light:placeholder:text-slate-400",
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
