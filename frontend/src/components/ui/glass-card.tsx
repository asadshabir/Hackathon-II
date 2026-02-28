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
        // Neumorphic background
        "bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900",
        // Neumorphic shadow
        "shadow-neu",
        // Border
        "border border-transparent",
        // Hover state - lift effect
        "hover:shadow-neuHover card-lift",
        // Active state
        "active:shadow-neuInner",
        // Performance-optimized transitions
        "transition-all duration-180 ease-[cubic-bezier(0.4,0,0.2,1)]",
        className
      )}
    >
      {children}
    </div>
  )
}
