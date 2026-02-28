"use client"

import type { ComponentType } from "react"
import { cn } from "@/lib/utils"

/**
 * StatCards Component
 *
 * Cards for Today, This Week, This Month, Streak Count, Overdue Count
 */

interface StatCardProps {
  title: string
  value: number | string
  icon: ComponentType<{ className?: string }>
  gradient: string
  accentBorder: string
  className?: string
}

export function StatCard({ title, value, icon: Icon, gradient: _gradient, accentBorder, className = "" }: StatCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 neumorphic p-6", className)}>
      <div className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</h3>
          <Icon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
        </div>
      </div>
      <div className={`text-3xl font-bold text-slate-800 dark:text-slate-200 ${accentBorder} border-l-4 pl-3`}>
        {value}
      </div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard
        title="Today"
        value={stats.completion_today}
        icon={({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>}
        gradient="from-indigo-500 to-indigo-600"
        accentBorder="bg-indigo-500"
      />
      <StatCard
        title="This Week"
        value={stats.completion_week}
        icon={({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M2 2v4h20V2H2Z"/><path d="M3 10h18"/><path d="M3 14h18"/><path d="M3 18h18"/></svg>}
        gradient="from-green-500 to-emerald-500"
        accentBorder="bg-emerald-500"
      />
      <StatCard
        title="This Month"
        value={stats.completion_month}
        icon={({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M2 2v4h20V2H2Z"/><path d="M3 10h18"/><path d="M3 14h18"/></svg>}
        gradient="from-blue-500 to-cyan-500"
        accentBorder="bg-cyan-500"
      />
      <StatCard
        title="Current Streak"
        value={stats.streak.current}
        icon={({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m12 8 2 2 4-4"/><path d="M8 16h.01"/></svg>}
        gradient="from-yellow-500 to-orange-500"
        accentBorder="bg-orange-500"
      />
      <StatCard
        title="Overdue"
        value={stats.overdue_count}
        icon={({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>}
        gradient="from-red-500 to-rose-500"
        accentBorder="bg-rose-500"
      />
    </div>
  )
}