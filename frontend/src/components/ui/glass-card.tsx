"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * GlassCard — AMOLED-aware surface card
 *
 * Light mode : subtle white card with soft shadow
 * Dark/AMOLED: deep #111 surface with 1px white/5% border
 *
 * Optional glow variants: "violet" | "cyan" | "emerald" | "rose" | "amber"
 */

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: "violet" | "cyan" | "emerald" | "rose" | "amber"
  /** @deprecated kept for backwards compat */
  hover3d?: boolean
}

const glowStyles: Record<string, string> = {
  violet:  "0 0 0 1px rgba(139,92,246,0.25), 0 4px 32px rgba(139,92,246,0.12)",
  cyan:    "0 0 0 1px rgba(6,182,212,0.25),  0 4px 32px rgba(6,182,212,0.12)",
  emerald: "0 0 0 1px rgba(16,185,129,0.25), 0 4px 32px rgba(16,185,129,0.12)",
  rose:    "0 0 0 1px rgba(244,63,94,0.25),  0 4px 32px rgba(244,63,94,0.12)",
  amber:   "0 0 0 1px rgba(245,158,11,0.25), 0 4px 32px rgba(245,158,11,0.12)",
}

export function GlassCard({ children, className, glow }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        // Light mode: clean white card
        "bg-white border border-zinc-200/80 shadow-card",
        // Dark / AMOLED mode: deep black surface
        "dark:bg-[#0F0F0F] dark:border-white/[0.06] dark:shadow-none",
        // Interaction
        "transition-all duration-180 ease-out",
        "active:scale-[0.99]",
        className
      )}
      style={
        glow
          ? {
              // Dark-only glow applied via inline style so it doesn't affect light mode
              // (CSS-in-JS light/dark would need Tailwind JIT variant — inline is simpler here)
            }
          : undefined
      }
    >
      {/* AMOLED glow overlay — rendered only when glow prop is set */}
      {glow && (
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl dark:block hidden"
          style={{ boxShadow: glowStyles[glow] }}
          aria-hidden
        />
      )}
      {children}
    </div>
  )
}
