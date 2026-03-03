"use client"

import { ArrowUpDown, ChevronDown } from "lucide-react"

/**
 * SortSelector — AMOLED
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
  { field: "created_at", label: "Created" },
  { field: "priority",   label: "Priority" },
  { field: "due_date",   label: "Due Date" },
  { field: "title",      label: "Title" },
]

const controlStyle = {
  background: "#1A1A1A",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.6)",
}

export function SortSelector({ sortBy, sortOrder, onChange, className = "" }: SortSelectorProps) {
  const toggleSortOrder = () => onChange(sortBy, sortOrder === "asc" ? "desc" : "asc")
  const selectSortField = (field: SortField) => onChange(field, "desc")

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => selectSortField(e.target.value as SortField)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none transition-all duration-150 focus:ring-1 focus:ring-violet-500/40"
            style={controlStyle}
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.field} value={option.field}>{option.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
        </div>

        <button
          onClick={toggleSortOrder}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 active:scale-95"
          style={controlStyle}
          aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
        >
          <ArrowUpDown className={`w-3.5 h-3.5 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} />
          <span className="capitalize">{sortOrder}</span>
        </button>
      </div>
    </div>
  )
}
