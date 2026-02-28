"use client"

import { ArrowUpDown, ChevronDown } from "lucide-react"

/**
 * SortSelector Component
 *
 * Dropdown with sort_by + sort_order options
 */

type SortField = "created_at" | "priority" | "due_date" | "title"
type SortOrder = "asc" | "desc"

interface SortOption {
  field: SortField
  label: string
}

interface SortSelectorProps {
  sortBy: SortField
  sortOrder: SortOrder
  onChange: (sortBy: SortField, sortOrder: SortOrder) => void
  className?: string
}

const SORT_OPTIONS: SortOption[] = [
  { field: "created_at", label: "Created Date" },
  { field: "priority", label: "Priority" },
  { field: "due_date", label: "Due Date" },
  { field: "title", label: "Title" },
]

export function SortSelector({ sortBy, sortOrder, onChange, className = "" }: SortSelectorProps) {
  const toggleSortOrder = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc"
    onChange(sortBy, newOrder)
  }

  const selectSortField = (field: SortField) => {
    onChange(field, "desc") // Default to descending when changing field
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => selectSortField(e.target.value as SortField)}
            className="appearance-none pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors min-w-[140px]"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.field} value={option.field}>{option.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <button
          onClick={toggleSortOrder}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
        >
          <ArrowUpDown className={`w-4 h-4 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} />
          <span className="capitalize">{sortOrder}</span>
        </button>
      </div>
    </div>
  )
}
