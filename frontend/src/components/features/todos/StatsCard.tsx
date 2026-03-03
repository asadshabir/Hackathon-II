"use client"

import type { LucideIcon } from "lucide-react"

/**
 * StatsCard Component
 *
 * AMOLED stats card with accent color icon and glow value
 */

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  accentColor: string
}

export function StatsCard({ title, value, icon: Icon, accentColor }: StatsCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: "#111318",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.06)`,
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-white/35 uppercase tracking-widest">{title}</p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${accentColor}18` }}
        >
          <Icon className="w-5 h-5" style={{ color: accentColor }} />
        </div>
      </div>
      <p
        className="text-3xl font-bold"
        style={{ color: accentColor }}
      >
        {value}
      </p>
    </div>
  )
}
