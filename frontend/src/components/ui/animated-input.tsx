"use client"

import { forwardRef } from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Premium Input Component
 *
 * Features:
 * - Clean focus border transition (indigo-500)
 * - Label positioned above input
 * - Error state with icon
 * - No glow effects or floating labels
 */

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, className, type = "text", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="w-full">
        {/* Label - positioned above input */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            {label}
          </label>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "w-full h-11 rounded-lg border px-4 py-2",
            "bg-white dark:bg-slate-900",
            "text-slate-900 dark:text-white",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20",
            className
          )}
          {...props}
        />

        {/* Error message with icon */}
        {error && (
          <p className="flex items-center gap-1 text-red-500 text-sm mt-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

AnimatedInput.displayName = "AnimatedInput"
