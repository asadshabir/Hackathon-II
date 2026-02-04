"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Premium Card Component
 *
 * Features:
 * - Solid background (no backdrop-blur on mobile for performance)
 * - Subtle shadow elevation
 * - Clean border styling
 * - Simple CSS transitions (150ms)
 */

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover3d?: boolean // Deprecated - kept for backwards compatibility, no longer uses 3D
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        // Solid background - better performance than backdrop-blur
        "bg-white dark:bg-slate-900",
        // Desktop-only glass effect (enabled via media query in globals.css)
        "md:glass",
        // Border
        "border border-slate-200 dark:border-slate-800",
        // Shadow - subtle elevation
        "shadow-card",
        // Hover state - lift + border shift
        "hover:border-indigo-200 dark:hover:border-slate-600",
        "hover:shadow-xl",
        // Performance-optimized transitions
        "transition-all duration-150",
        className
      )}
    >
      {children}
    </div>
  )
}
