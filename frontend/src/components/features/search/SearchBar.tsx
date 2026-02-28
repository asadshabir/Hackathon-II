"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"

/**
 * SearchBar Component
 *
 * Text input with 300ms debounce, clear button, and result count display.
 */

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  resultCount?: number
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  resultCount,
  placeholder = "Search tasks...",
  className = "",
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      onChange(newValue)
    }, 300)
  }

  const handleClear = () => {
    setLocalValue("")
    onChange("")
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full pl-12 pr-20 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {resultCount !== undefined && localValue && (
          <span className="text-xs text-slate-400 tabular-nums">
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </span>
        )}
        {localValue && (
          <button
            onClick={handleClear}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
    </div>
  )
}
