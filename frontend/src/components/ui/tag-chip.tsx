"use client"

import { X } from "lucide-react"

/**
 * TagChip Component
 *
 * Color-coded chip for displaying tags.
 * Optional delete button for management views.
 */

interface TagChipProps {
  name: string
  color: string
  onDelete?: () => void
  onClick?: () => void
  selected?: boolean
  size?: "sm" | "md"
  className?: string
}

export function TagChip({
  name,
  color,
  onDelete,
  onClick,
  selected = false,
  size = "sm",
  className = "",
}: TagChipProps) {
  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-xs"
    : "px-3 py-1 text-sm"

  const selectedClasses = selected
    ? "ring-2 ring-offset-1 ring-indigo-500 dark:ring-offset-slate-900"
    : ""

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-all duration-150 ${sizeClasses} ${selectedClasses} ${className} ${
        onClick ? "cursor-pointer hover:opacity-80" : ""
      }`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: color,
        border: `1px solid ${color}40`,
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{name}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="ml-0.5 hover:opacity-100 opacity-60 transition-opacity"
          aria-label={`Remove tag ${name}`}
        >
          <X className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
        </button>
      )}
    </span>
  )
}
