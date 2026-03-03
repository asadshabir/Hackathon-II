"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * RecurrenceSelector — AMOLED
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
    { value: "none",    label: "None" },
    { value: "daily",   label: "Daily" },
    { value: "weekly",  label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ]

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <Select value={recurrenceType} onValueChange={onTypeChange}>
        <SelectTrigger
          className="w-[120px] rounded-xl text-sm border-0 focus:ring-1 focus:ring-indigo-500/40"
          style={{ background: "#181B23", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
        >
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
          <span className="text-xs text-white/35">Every</span>
          <input
            type="number"
            min="1"
            value={recurrenceInterval}
            onChange={(e) => onIntervalChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-14 px-2 py-1.5 rounded-lg text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/40"
            style={{ background: "#181B23", border: "1px solid rgba(255,255,255,0.08)" }}
          />
          <span className="text-xs text-white/35 capitalize">{recurrenceType}s</span>
        </div>
      )}
    </div>
  )
}
