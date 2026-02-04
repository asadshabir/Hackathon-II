"use client"

import { ReactNode, forwardRef, ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

/**
 * Premium Button Component
 *
 * Features:
 * - Clean hover states with CSS transitions (150ms)
 * - Loading state with spinner
 * - Multiple variants: primary, secondary, outline, ghost
 * - No heavy animations or shimmer effects
 */

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "outline" | "ghost"
  isLoading?: boolean
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, variant = "primary", isLoading, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm",
      secondary: "bg-slate-700 text-white hover:bg-slate-800 active:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-700",
      outline: "border-2 border-indigo-600 text-indigo-600 bg-transparent hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950/50",
      ghost: "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative overflow-hidden rounded-lg px-6 py-3 font-semibold",
          "transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2",
          variants[variant],
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <div className="h-5 w-5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            children
          )}
        </span>
      </button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"
