"use client"

import type { ComponentType, CSSProperties } from "react"

/**
 * StatCards Component
 *
 * AMOLED analytics stat cards — Today, This Week, This Month, Streak, Overdue
 */

interface StatCardProps {
  title: string
  value: number | string
  icon: ComponentType<{ className?: string; style?: CSSProperties }>
  accentColor: string
  glowColor: string
}

export function StatCard({ title, value, icon: Icon, accentColor, glowColor }: StatCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: "#0F0F0F",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 0 0 1px ${glowColor}20`,
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-white/35 uppercase tracking-widest">{title}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${accentColor}18` }}
        >
          <Icon className="h-4 w-4" style={{ color: accentColor }} />
        </div>
      </div>
      <p
        className="text-3xl font-bold"
        style={{ color: accentColor, textShadow: `0 0 20px ${glowColor}` }}
      >
        {value}
      </p>
    </div>
  )
}

interface StatCardsProps {
  stats: {
    completion_today: number
    completion_week: number
    completion_month: number
    streak: {
      current: number
      longest: number
    }
    overdue_count: number
  }
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard
        title="Today"
        value={stats.completion_today}
        accentColor="#8B5CF6"
        glowColor="#8B5CF6"
        icon={({ className, style }) => (
          <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2v4"/><path d="M16 2v4"/>
            <rect width="18" height="18" x="3" y="4" rx="2"/>
            <path d="M3 10h18"/>
          </svg>
        )}
      />
      <StatCard
        title="This Week"
        value={stats.completion_week}
        accentColor="#10B981"
        glowColor="#10B981"
        icon={({ className, style }) => (
          <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20"/><path d="M2 2v4h20V2H2Z"/>
            <path d="M3 10h18"/><path d="M3 14h18"/><path d="M3 18h18"/>
          </svg>
        )}
      />
      <StatCard
        title="This Month"
        value={stats.completion_month}
        accentColor="#06B6D4"
        glowColor="#06B6D4"
        icon={({ className, style }) => (
          <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20"/><path d="M2 2v4h20V2H2Z"/>
            <path d="M3 10h18"/><path d="M3 14h18"/>
          </svg>
        )}
      />
      <StatCard
        title="Streak"
        value={`${stats.streak.current}d`}
        accentColor="#F59E0B"
        glowColor="#F59E0B"
        icon={({ className, style }) => (
          <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="m12 8 2 2 4-4"/>
            <path d="M8 16h.01"/>
          </svg>
        )}
      />
      <StatCard
        title="Overdue"
        value={stats.overdue_count}
        accentColor="#F43F5E"
        glowColor="#F43F5E"
        icon={({ className, style }) => (
          <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4"/>
            <path d="M12 16h.01"/>
          </svg>
        )}
      />
    </div>
  )
}
