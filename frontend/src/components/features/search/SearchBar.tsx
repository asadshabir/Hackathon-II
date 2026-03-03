"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  resultCount?: number
  placeholder?: string
  className?: string
}

export function SearchBar({
  value, onChange, resultCount, placeholder = "Search tasks...", className = "",
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setLocalValue(value) }, [value])

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

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "rgba(255,255,255,0.25)" }} />
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full pl-10 pr-20 py-2.5 rounded-xl text-sm outline-none transition-all duration-150 focus:ring-1 focus:ring-indigo-500/40 placeholder:opacity-0"
        style={{
          background: "#181B23",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.88)",
        }}
      />
      {/* placeholder done via CSS since inline style doesn't apply to ::placeholder */}
      <style>{`input::placeholder { color: rgba(255,255,255,0.25); opacity: 1; }`}</style>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {resultCount !== undefined && localValue && (
          <span className="text-[10px] tabular-nums" style={{ color: "rgba(255,255,255,0.28)" }}>
            {resultCount}
          </span>
        )}
        {localValue && (
          <button onClick={handleClear} className="p-1 rounded-md transition-colors" aria-label="Clear search">
            <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.30)" }} />
          </button>
        )}
      </div>
    </div>
  )
}
