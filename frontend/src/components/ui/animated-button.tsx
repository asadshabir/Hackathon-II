"use client"

import { ReactNode, forwardRef, ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "outline" | "ghost"
  isLoading?: boolean
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, variant = "primary", isLoading, disabled, style, ...props }, ref) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      primary:   {
        background: "linear-gradient(135deg, #4F46E5, #6366F1)",
        color: "#fff",
        boxShadow: "0 0 16px rgba(99,102,241,0.28)",
      },
      secondary: {
        background: "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.70)",
        border: "1px solid rgba(255,255,255,0.08)",
      },
      outline: {
        background: "transparent",
        color: "#818CF8",
        border: "1px solid rgba(99,102,241,0.35)",
      },
      ghost: {
        background: "transparent",
        color: "rgba(255,255,255,0.50)",
      },
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold",
          "transition-all duration-150 active:scale-95",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-1 focus:ring-indigo-500/40",
          className
        )}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
              <span>Loading...</span>
            </>
          ) : children}
        </span>
      </button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"
