"use client"

import { motion } from "framer-motion"
import { Check, Clock, Trash2, Edit, Flag, Calendar } from "lucide-react"
import type { Todo } from "@/types/todo"
import { GlassCard } from "@/components/ui/glass-card"

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

const priorityColors = {
  low: "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400",
  medium: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
  high: "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400",
}

const priorityBorder = {
  low: "border-l-green-500",
  medium: "border-l-amber-500",
  high: "border-l-red-500",
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
      <GlassCard className={`p-5 border-l-4 ${priorityBorder[todo.priority]}`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Checkbox - 44px touch target */}
              <button
                onClick={() => onToggle(todo.id)}
                className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg border-2 flex items-center justify-center transition-colors duration-150 ${
                  todo.completed
                    ? "bg-indigo-600 border-indigo-600"
                    : "border-slate-300 dark:border-slate-600 hover:border-indigo-500"
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
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[todo.priority]}`}
            >
              <Flag className="w-3 h-3" />
              <span className="capitalize">{todo.priority}</span>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2">
            {/* Category */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[todo.category]}`}>
              {todo.category}
            </span>

            {/* Due Date */}
            {todo.dueDate && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                <Calendar className="w-3 h-3" />
                {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}

            {/* Status */}
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
              <Clock className="w-3 h-3" />
              {todo.status.replace("-", " ")}
            </span>
          </div>

          {/* Actions - 44px touch targets */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEdit(todo)}
              className="min-h-[44px] flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors duration-150"
              aria-label="Edit task"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>

            <button
              onClick={() => onDelete(todo.id)}
              className="min-h-[44px] flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 text-sm font-medium transition-colors duration-150"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
