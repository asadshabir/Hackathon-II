"use client"

import { X } from "lucide-react"
import type { TodoPriority, TodoCategory } from "@/types/todo"

/**
 * FilterPanel Component
 *
 * Priority dropdown, category dropdown, status toggle, date range picker.
 * Shows active filter chips with click-to-remove.
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

export function FilterPanel({ filters, onFilterChange, className = "" }: FilterPanelProps) {
  const activeChips: { label: string; key: keyof ActiveFilters; resetValue: string }[] = []

  if (filters.priority !== "all") {
    activeChips.push({ label: `Priority: ${filters.priority}`, key: "priority", resetValue: "all" })
  }
  if (filters.category !== "all") {
    activeChips.push({ label: `Category: ${filters.category}`, key: "category", resetValue: "all" })
  }
  if (filters.status !== "all") {
    activeChips.push({ label: `Status: ${filters.status}`, key: "status", resetValue: "all" })
  }
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
      {/* Filter Dropdowns */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filters.priority}
          onChange={(e) => onFilterChange("priority", e.target.value as TodoPriority | "all")}
          className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none min-w-[140px]"
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
          className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none min-w-[140px]"
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
          className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none min-w-[120px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => onFilterChange(chip.key, chip.resetValue as never)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-950/70 transition-colors"
            >
              {chip.label}
              <X className="w-3.5 h-3.5" />
            </button>
          ))}
          <button
            onClick={clearAll}
            className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
