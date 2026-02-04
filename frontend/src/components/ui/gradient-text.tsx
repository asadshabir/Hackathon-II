"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Gradient Text Component
 *
 * Features:
 * - Static gradient colors (no animation for performance)
 * - Configurable via className
 * - Uses indigo as primary accent color
 */

interface GradientTextProps {
  children: ReactNode
  className?: string
  animate?: boolean // Deprecated - kept for backwards compatibility, no longer animates
}

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <h1
      className={cn(
        "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent",
        "font-bold",
        className
      )}
    >
      {children}
    </h1>
  )
}
