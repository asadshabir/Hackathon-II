"use client"

import { Calendar } from "lucide-react"

/**
 * DatePickerInput Component
 *
 * Lightweight date picker wrapper around native input[type=date].
 * Shows overdue warning when date is in the past.
 */

interface DatePickerInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  showOverdueWarning?: boolean
  className?: string
}

export function DatePickerInput({
  value,
  onChange,
  label,
  placeholder = "Select date",
  showOverdueWarning = true,
  className = "",
}: DatePickerInputProps) {
  const isOverdue = value && new Date(value) < new Date(new Date().toDateString())

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-slate-600 dark:text-white/50 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#181B23] border text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-colors duration-150 [color-scheme:dark] ${
            isOverdue && showOverdueWarning
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-200 dark:border-white/[0.08] focus:border-indigo-500 dark:focus:border-indigo-500/60 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/10"
          }`}
        />
      </div>
      {isOverdue && showOverdueWarning && (
        <p className="text-xs text-red-500 mt-1">This date is in the past (overdue)</p>
      )}
    </div>
  )
}
