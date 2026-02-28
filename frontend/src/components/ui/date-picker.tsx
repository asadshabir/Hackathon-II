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
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-colors duration-150 ${
            isOverdue && showOverdueWarning
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
          }`}
        />
      </div>
      {isOverdue && showOverdueWarning && (
        <p className="text-xs text-red-500 mt-1">This date is in the past (overdue)</p>
      )}
    </div>
  )
}
