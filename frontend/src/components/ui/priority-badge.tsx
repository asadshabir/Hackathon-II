"use client"

import { Flag } from "lucide-react"
import type { TodoPriority } from "@/types/todo"

/**
 * PriorityBadge Component
 *
 * Color-coded badge for task priority levels.
 * green=low, yellow=medium, orange=high, red=urgent
 */

const priorityConfig: Record<
  TodoPriority,
  { bg: string; text: string; border: string; label: string }
> = {
  low: {
    bg: "bg-green-100 dark:bg-green-950/50",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-500",
    label: "Low",
  },
  medium: {
    bg: "bg-amber-100 dark:bg-amber-950/50",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500",
    label: "Medium",
  },
  high: {
    bg: "bg-orange-100 dark:bg-orange-950/50",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-500",
    label: "High",
  },
  urgent: {
    bg: "bg-red-100 dark:bg-red-950/50",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-500",
    label: "Urgent",
  },
}

interface PriorityBadgeProps {
  priority: TodoPriority
  showIcon?: boolean
  size?: "sm" | "md"
  className?: string
}

export function PriorityBadge({
  priority,
  showIcon = true,
  size = "sm",
  className = "",
}: PriorityBadgeProps) {
  const config = priorityConfig[priority] || priorityConfig.medium

  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-xs"
    : "px-2.5 py-1 text-sm"

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses} ${className}`}
    >
      {showIcon && <Flag className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      <span>{config.label}</span>
    </span>
  )
}

/** Get the border color class for a priority level (used in card borders). */
export function getPriorityBorderColor(priority: TodoPriority): string {
  return priorityConfig[priority]?.border || priorityConfig.medium.border
}
