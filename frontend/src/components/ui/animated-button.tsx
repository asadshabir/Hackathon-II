"use client"

import { ReactNode, forwardRef, ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

/**
 * AnimatedButton — AMOLED
 */

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "outline" | "ghost"
  isLoading?: boolean
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, variant = "primary", isLoading, disabled, style, ...props }, ref) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      primary:   { background: "linear-gradient(135deg,#7C3AED,#8B5CF6)", color: "#fff", boxShadow: "0 0 16px rgba(139,92,246,0.3)" },
      secondary: { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" },
      outline:   { background: "transparent", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.4)" },
      ghost:     { background: "transparent", color: "rgba(255,255,255,0.5)" },
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold",
          "transition-all duration-150 active:scale-95",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-1 focus:ring-violet-500/40",
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
          ) : (
            children
          )}
        </span>
      </button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"
