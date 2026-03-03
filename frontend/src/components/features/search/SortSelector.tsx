"use client"

import { ArrowUpDown, ChevronDown } from "lucide-react"

type SortField = "created_at" | "priority" | "due_date" | "title"
type SortOrder = "asc" | "desc"

interface SortSelectorProps {
  sortBy: SortField
  sortOrder: SortOrder
  onChange: (sortBy: SortField, sortOrder: SortOrder) => void
  className?: string
}

const SORT_OPTIONS = [
  { field: "created_at" as SortField, label: "Created" },
  { field: "priority"   as SortField, label: "Priority" },
  { field: "due_date"   as SortField, label: "Due Date" },
  { field: "title"      as SortField, label: "Title" },
]

const ctrlStyle = {
  background: "#181B23",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.60)",
}

export function SortSelector({ sortBy, sortOrder, onChange, className = "" }: SortSelectorProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => onChange(e.target.value as SortField, "desc")}
          className="appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none transition-all duration-150 focus:ring-1 focus:ring-indigo-500/40"
          style={ctrlStyle}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.field} value={o.field}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "rgba(255,255,255,0.28)" }} />
      </div>

      <button
        onClick={() => onChange(sortBy, sortOrder === "asc" ? "desc" : "asc")}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 active:scale-95"
        style={ctrlStyle}
        aria-label="Toggle sort order"
      >
        <ArrowUpDown className={`w-3.5 h-3.5 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} />
        <span className="capitalize">{sortOrder}</span>
      </button>
    </div>
  )
}
