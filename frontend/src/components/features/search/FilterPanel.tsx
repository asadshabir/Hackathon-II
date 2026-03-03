"use client"

import { X } from "lucide-react"
import type { TodoPriority, TodoCategory } from "@/types/todo"

/**
 * FilterPanel — AMOLED
 */

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
  background: "#1A1A1A",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.6)",
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
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange("priority", e.target.value as TodoPriority | "all")}
          className="px-3 py-2.5 rounded-xl text-sm outline-none appearance-none transition-all duration-150 focus:ring-1 focus:ring-violet-500/40"
          style={selectStyle}
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => onFilterChange("category", e.target.value as TodoCategory | "all")}
          className="px-3 py-2.5 rounded-xl text-sm outline-none appearance-none transition-all duration-150 focus:ring-1 focus:ring-violet-500/40"
          style={selectStyle}
        >
          <option value="all">All Categories</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="shopping">Shopping</option>
          <option value="health">Health</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value as "all" | "completed" | "active")}
          className="px-3 py-2.5 rounded-xl text-sm outline-none appearance-none transition-all duration-150 focus:ring-1 focus:ring-violet-500/40"
          style={selectStyle}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {activeChips.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2.5">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => onFilterChange(chip.key, chip.resetValue as never)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors active:scale-95"
              style={{
                background: "rgba(139,92,246,0.12)",
                color: "#A78BFA",
                border: "1px solid rgba(139,92,246,0.25)",
              }}
            >
              {chip.label}
              <X className="w-3 h-3" />
            </button>
          ))}
          <button
            onClick={clearAll}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors active:scale-95"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
