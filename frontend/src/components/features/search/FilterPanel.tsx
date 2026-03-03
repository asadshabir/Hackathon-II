"use client"

import { X } from "lucide-react"
import type { TodoPriority, TodoCategory } from "@/types/todo"

interface ActiveFilters {
  priority: TodoPriority | "all"
  category: TodoCategory | "all"
  status: "all" | "completed" | "active"
  dueDateFilter: "all" | "today" | "this_week" | "overdue"
}

interface FilterPanelProps {
  filters: ActiveFilters
  onFilterChange: <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => void
  className?: string
}

const selectStyle = {
  background: "#181B23",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.60)",
}

export function FilterPanel({ filters, onFilterChange, className = "" }: FilterPanelProps) {
  const activeChips: { label: string; key: keyof ActiveFilters; resetValue: string }[] = []

  if (filters.priority !== "all") activeChips.push({ label: `Priority: ${filters.priority}`, key: "priority", resetValue: "all" })
  if (filters.category !== "all") activeChips.push({ label: `Category: ${filters.category}`, key: "category", resetValue: "all" })
  if (filters.status !== "all") activeChips.push({ label: `Status: ${filters.status}`, key: "status", resetValue: "all" })
  if (filters.dueDateFilter !== "all") {
    const dueLabels = { today: "Today", this_week: "This Week", overdue: "Overdue", all: "All" }
    activeChips.push({ label: `Due: ${dueLabels[filters.dueDateFilter]}`, key: "dueDateFilter", resetValue: "all" })
  }

  const clearAll = () => {
    onFilterChange("priority", "all")
    onFilterChange("category", "all")
    onFilterChange("status", "all")
    onFilterChange("dueDateFilter", "all")
  }

  return (
    <div className={className}>
      <div className="flex gap-2 flex-wrap">
        {[
          {
            value: filters.priority,
            onChange: (v: string) => onFilterChange("priority", v as TodoPriority | "all"),
            options: [["all","All Priorities"],["urgent","Urgent"],["high","High"],["medium","Medium"],["low","Low"]],
          },
          {
            value: filters.category,
            onChange: (v: string) => onFilterChange("category", v as TodoCategory | "all"),
            options: [["all","All Categories"],["work","Work"],["personal","Personal"],["shopping","Shopping"],["health","Health"],["other","Other"]],
          },
          {
            value: filters.status,
            onChange: (v: string) => onFilterChange("status", v as "all"|"completed"|"active"),
            options: [["all","All Status"],["active","Active"],["completed","Completed"]],
          },
        ].map((sel, i) => (
          <select
            key={i}
            value={sel.value}
            onChange={(e) => sel.onChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm outline-none appearance-none transition-all duration-150 focus:ring-1 focus:ring-indigo-500/40"
            style={selectStyle}
          >
            {sel.options.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        ))}
      </div>

      {activeChips.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2.5">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => onFilterChange(chip.key, chip.resetValue as never)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors active:scale-95"
              style={{
                background: "rgba(99,102,241,0.10)",
                color: "#818CF8",
                border: "1px solid rgba(99,102,241,0.22)",
              }}
            >
              {chip.label}
              <X className="w-3 h-3" />
            </button>
          ))}
          <button
            onClick={clearAll}
            className="px-3 py-1 rounded-full text-xs font-medium active:scale-95"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.38)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
