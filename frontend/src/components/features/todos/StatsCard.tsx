"use client"

import type { LucideIcon } from "lucide-react"

/**
 * StatsCard Component — Colorful 3D animated
 */

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  accentColor: string
  gradientFrom?: string
  gradientTo?: string
}

export function StatsCard({ title, value, icon: Icon, accentColor, gradientFrom, gradientTo }: StatsCardProps) {
  const gFrom = gradientFrom ?? `${accentColor}20`
  const gTo   = gradientTo   ?? `${accentColor}06`

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 flex flex-col gap-3 shimmer-card transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.02]"
      style={{
        background: `linear-gradient(135deg, ${gFrom} 0%, ${gTo} 100%)`,
        boxShadow: `0 0 0 1px ${accentColor}28, 0 8px 24px ${accentColor}14`,
      }}
    >
      {/* Ambient orb */}
      <div
        className="absolute -top-5 -right-5 w-20 h-20 rounded-full blur-2xl pointer-events-none glow-breathe"
        style={{ background: accentColor, opacity: 0.18 }}
      />

      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{title}</p>

        {/* 3D floating icon container */}
        <div
          className="relative w-10 h-10 rounded-2xl flex items-center justify-center icon-3d icon-float"
          style={{
            background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}15)`,
            boxShadow: `0 4px 16px ${accentColor}35, 0 0 0 1px ${accentColor}25`,
          }}
        >
          <Icon
            className="w-5 h-5"
            style={{ color: accentColor, filter: `drop-shadow(0 2px 6px ${accentColor}80)` }}
            strokeWidth={2.2}
          />
        </div>
      </div>

      <p
        className="text-3xl font-black number-pop tabular-nums"
        style={{ color: accentColor, textShadow: `0 0 20px ${accentColor}55` }}
      >
        {value}
      </p>
    </div>
  )
}
