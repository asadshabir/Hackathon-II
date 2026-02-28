"use client"

import { motion } from "framer-motion"
import { Check, Clock, Trash2, Edit, Calendar } from "lucide-react"
import type { Todo } from "@/types/todo"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { cn } from "@/lib/utils"

/**
 * TodoCard Component
 *
 * Clean card for displaying and managing individual todos
 * Optimized for touch with min 44px touch targets
 */

interface TodoCardProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
}

const priorityBorder = {
  low: "border-l-green-500",
  medium: "border-l-amber-500",
  high: "border-l-orange-500",
  urgent: "border-l-red-500",
}

const categoryColors = {
  personal: "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400",
  work: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
  shopping: "bg-pink-100 dark:bg-pink-950/50 text-pink-700 dark:text-pink-400",
  health: "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400",
  other: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400",
}

export function TodoCard({ todo, onToggle, onDelete, onEdit }: TodoCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
    >
      <div className={cn(
        "relative overflow-hidden rounded-xl",
        // Neumorphic background
        "bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900",
        // Neumorphic shadow
        "shadow-neu",
        // Border for priority
        `border-l-4 ${priorityBorder[todo.priority]}`,
        // Hover state - lift effect
        "hover:shadow-neuHover card-lift",
        // Active state
        "active:shadow-neuInner",
        // Performance-optimized transitions
        "transition-all duration-180 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "p-5"
      )}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Checkbox - 44px touch target */}
              <button
                onClick={() => onToggle(todo.id)}
                className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg border-2 flex items-center justify-center transition-colors duration-150 ${
                  todo.completed
                    ? "bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-600 shadow-neuInner"
                    : "bg-gradient-to-br from-white to-slate-50 border-slate-300 dark:border-slate-600 shadow-neu hover:shadow-neuHover"
                }`}
                aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {todo.completed && <Check className="w-5 h-5 text-white" />}
              </button>

              {/* Title & Description */}
              <div className="flex-1 min-w-0 pt-2">
                <h3
                  className={`text-base font-semibold text-slate-900 dark:text-white transition-opacity duration-150 ${
                    todo.completed ? "line-through opacity-50" : ""
                  }`}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{todo.description}</p>
                )}
              </div>
            </div>

            {/* Priority Badge */}
            <PriorityBadge priority={todo.priority} size="md" />
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2">
            {/* Category */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[todo.category]}`}>
              {todo.category}
            </span>

            {/* Due Date */}
            {todo.dueDate && (() => {
              try {
                const date = new Date(todo.dueDate);
                if (isNaN(date.getTime())) {
                  return null;
                }
                return (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-600 dark:text-slate-400 text-xs neumorphic">
                    <Calendar className="w-3 h-3" />
                    {date.toLocaleDateString()}
                  </span>
                );
              } catch (e) {
                return null;
              }
            })()}

            {/* Recurring Indicator */}
            {todo.recurrenceType && todo.recurrenceType !== "none" && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-xs neumorphic">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 0-9 9c0-1.3 0.2-2.6 0.5-3.9" />
                  <path d="M16 3v4h-4" />
                </svg>
                {(todo.recurrenceInterval ?? 1) > 1 ? `${todo.recurrenceInterval} ` : ''}{todo.recurrenceType}{(todo.recurrenceInterval ?? 1) > 1 ? 's' : ''}
              </span>
            )}

            {/* Status */}
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-600 dark:text-slate-400 text-xs neumorphic">
              <Clock className="w-3 h-3" />
              {todo.status.replace("-", " ")}
            </span>
          </div>

          {/* Actions - 44px touch targets */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEdit(todo)}
              className="min-h-[44px] flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 dark:from-slate-800 dark:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium transition-all duration-150 neumorphic"
              aria-label="Edit task"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>

            <button
              onClick={() => onDelete(todo.id)}
              className="min-h-[44px] flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 dark:from-red-900/30 dark:to-red-900/50 dark:hover:from-red-900/50 dark:hover:to-red-800/50 text-red-600 dark:text-red-400 text-sm font-medium transition-all duration-150 neumorphic"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
