"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * RecurrenceSelector Component
 *
 * Dropdown: None/Daily/Weekly/Monthly with interval input
 */

interface RecurrenceSelectorProps {
  recurrenceType: string
  recurrenceInterval: number
  onTypeChange: (type: string) => void
  onIntervalChange: (interval: number) => void
  className?: string
}

export function RecurrenceSelector({
  recurrenceType,
  recurrenceInterval,
  onTypeChange,
  onIntervalChange,
  className = ""
}: RecurrenceSelectorProps) {
  const recurrenceOptions = [
    { value: "none", label: "None" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ]

  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={recurrenceType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {recurrenceOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {recurrenceType !== "none" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Every</span>
          <input
            type="number"
            min="1"
            value={recurrenceInterval}
            onChange={(e) => onIntervalChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-500 capitalize">{recurrenceType}s</span>
        </div>
      )}
    </div>
  )
}