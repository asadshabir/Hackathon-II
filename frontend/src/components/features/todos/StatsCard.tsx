"use client"

import { LucideIcon } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

/**
 * StatsCard Component
 *
 * Clean statistics card with icon and count
 * No heavy animations - static display
 */

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  gradient: string
  accentBorder?: string
  delay?: number // Deprecated - kept for backwards compatibility
}

export function StatsCard({ title, value, icon: Icon, gradient, accentBorder }: StatsCardProps) {
  return (
    <GlassCard className="overflow-hidden">
      {accentBorder && <div className={`h-0.5 ${accentBorder}`} />}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
          </div>

          <div
            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
