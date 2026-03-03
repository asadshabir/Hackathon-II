"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"

/**
 * SearchBar — AMOLED
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

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setLocalValue(newValue)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onChange(newValue), 300)
  }

  const handleClear = () => {
    setLocalValue("")
    onChange("")
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full pl-10 pr-20 py-2.5 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all duration-150 focus:ring-1 focus:ring-violet-500/40"
        style={{
          background: "#1A1A1A",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {resultCount !== undefined && localValue && (
          <span className="text-[10px] text-white/30 tabular-nums">
            {resultCount}
          </span>
        )}
        {localValue && (
          <button
            onClick={handleClear}
            className="p-1 rounded-md transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
