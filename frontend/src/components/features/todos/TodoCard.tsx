"use client"

import { motion } from "framer-motion"
import { Check, Clock, Trash2, Edit, Calendar } from "lucide-react"
import type { Todo } from "@/types/todo"
import { PriorityBadge } from "@/components/ui/priority-badge"

interface TodoCardProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
}

const priorityAccent: Record<string, string> = {
  low:    "#10B981",
  medium: "#F59E0B",
  high:   "#F97316",
  urgent: "#EF4444",
}

const categoryStyle: Record<string, { bg: string; color: string }> = {
  personal: { bg: "rgba(99,102,241,0.10)",  color: "#818CF8" },
  work:     { bg: "rgba(56,189,248,0.10)",  color: "#38BDF8" },
  shopping: { bg: "rgba(236,72,153,0.10)",  color: "#F472B6" },
  health:   { bg: "rgba(16,185,129,0.10)",  color: "#34D399" },
  other:    { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.42)" },
}

export function TodoCard({ todo, onToggle, onDelete, onEdit }: TodoCardProps) {
  const accent = priorityAccent[todo.priority] ?? "#6366F1"
  const cat = categoryStyle[todo.category] ?? categoryStyle.other

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="relative overflow-hidden rounded-xl p-4 transition-all duration-150"
        style={{
          background: "#111318",
          boxShadow: `0 0 0 1px rgba(255,255,255,0.07), inset 3px 0 0 ${accent}`,
        }}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              {/* Checkbox */}
              <button
                onClick={() => onToggle(todo.id)}
                className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-lg border flex items-center justify-center transition-all duration-150 active:scale-90 flex-shrink-0"
                style={
                  todo.completed
                    ? {
                        background: "linear-gradient(135deg, #4F46E5, #6366F1)",
                        borderColor: "rgba(99,102,241,0.4)",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        borderColor: "rgba(255,255,255,0.10)",
                      }
                }
                aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {todo.completed && <Check className="w-4 h-4 text-white" strokeWidth={2.5} />}
              </button>

              {/* Title */}
              <div className="flex-1 min-w-0 pt-1.5">
                <h3
                  className="text-sm font-semibold transition-opacity duration-150"
                  style={{
                    color: todo.completed ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.88)",
                    textDecoration: todo.completed ? "line-through" : "none",
                  }}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {todo.description}
                  </p>
                )}
              </div>
            </div>
            <PriorityBadge priority={todo.priority} size="md" />
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: cat.bg, color: cat.color }}>
              {todo.category}
            </span>

            {todo.dueDate && (() => {
              try {
                const date = new Date(todo.dueDate)
                if (isNaN(date.getTime())) return null
                return (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.42)" }}>
                    <Calendar className="w-3 h-3" />
                    {date.toLocaleDateString()}
                  </span>
                )
              } catch { return null }
            })()}

            {todo.recurrenceType && todo.recurrenceType !== "none" && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(99,102,241,0.10)", color: "#818CF8" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 0-9 9c0-1.3 0.2-2.6 0.5-3.9" /><path d="M16 3v4h-4" />
                </svg>
                {(todo.recurrenceInterval ?? 1) > 1 ? `${todo.recurrenceInterval} ` : ""}
                {todo.recurrenceType}{(todo.recurrenceInterval ?? 1) > 1 ? "s" : ""}
              </span>
            )}

            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}>
              <Clock className="w-3 h-3" />
              {todo.status.replace("-", " ")}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(todo)}
              className="min-h-[40px] flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.58)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              aria-label="Edit task"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </button>

            <button
              onClick={() => onDelete(todo.id)}
              className="min-h-[40px] flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95"
              style={{
                background: "rgba(239,68,68,0.08)",
                color: "#F87171",
                border: "1px solid rgba(239,68,68,0.18)",
              }}
              aria-label="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
