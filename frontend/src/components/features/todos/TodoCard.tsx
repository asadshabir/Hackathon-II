"use client"

import { motion } from "framer-motion"
import { Check, Clock, Trash2, Edit, Calendar, Repeat } from "lucide-react"
import type { Todo } from "@/types/todo"
import { PriorityBadge } from "@/components/ui/priority-badge"

interface TodoCardProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
}

const priorityConfig: Record<string, { accent: string; gradFrom: string; gradTo: string; glow: string }> = {
  low:    { accent: "#10B981", gradFrom: "rgba(16,185,129,0.12)",  gradTo: "rgba(16,185,129,0.03)",  glow: "rgba(16,185,129,0.20)"  },
  medium: { accent: "#F59E0B", gradFrom: "rgba(245,158,11,0.12)",  gradTo: "rgba(245,158,11,0.03)",  glow: "rgba(245,158,11,0.20)"  },
  high:   { accent: "#F97316", gradFrom: "rgba(249,115,22,0.13)",  gradTo: "rgba(249,115,22,0.03)",  glow: "rgba(249,115,22,0.22)"  },
  urgent: { accent: "#EF4444", gradFrom: "rgba(239,68,68,0.14)",   gradTo: "rgba(239,68,68,0.03)",   glow: "rgba(239,68,68,0.22)"   },
}

const categoryStyle: Record<string, { bg: string; color: string; border: string }> = {
  personal: { bg: "rgba(99,102,241,0.14)",  color: "#818CF8", border: "rgba(99,102,241,0.25)"  },
  work:     { bg: "rgba(56,189,248,0.14)",  color: "#38BDF8", border: "rgba(56,189,248,0.25)"  },
  shopping: { bg: "rgba(236,72,153,0.14)",  color: "#F472B6", border: "rgba(236,72,153,0.25)"  },
  health:   { bg: "rgba(16,185,129,0.14)",  color: "#34D399", border: "rgba(16,185,129,0.25)"  },
  other:    { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.48)", border: "rgba(255,255,255,0.10)" },
}

export function TodoCard({ todo, onToggle, onDelete, onEdit }: TodoCardProps) {
  const cfg = priorityConfig[todo.priority ?? "medium"] ?? priorityConfig.medium
  const cat = categoryStyle[todo.category ?? "other"] ?? categoryStyle.other

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <div
        className="relative overflow-hidden rounded-2xl p-4 shimmer-card transition-shadow duration-200"
        style={{
          background: todo.completed
            ? "rgba(255,255,255,0.03)"
            : `linear-gradient(135deg, ${cfg.gradFrom} 0%, ${cfg.gradTo} 100%)`,
          boxShadow: todo.completed
            ? "0 0 0 1px rgba(255,255,255,0.06)"
            : `0 0 0 1px ${cfg.glow}, 0 4px 20px ${cfg.glow}`,
        }}
      >
        {/* Priority accent bar */}
        {!todo.completed && (
          <div
            className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
            style={{ background: `linear-gradient(180deg, ${cfg.accent}, ${cfg.accent}60)`, boxShadow: `2px 0 8px ${cfg.accent}50` }}
          />
        )}

        {/* Ambient corner glow */}
        {!todo.completed && (
          <div
            className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
            style={{ background: cfg.accent, opacity: 0.10 }}
          />
        )}

        <div className="space-y-3 pl-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              {/* Animated checkbox */}
              <motion.button
                onClick={() => onToggle(todo.id)}
                whileTap={{ scale: 0.82 }}
                whileHover={{ scale: 1.08 }}
                className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                style={
                  todo.completed
                    ? {
                        background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accent}cc)`,
                        borderColor: cfg.accent,
                        boxShadow: `0 0 12px ${cfg.accent}50`,
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        borderColor: `${cfg.accent}60`,
                      }
                }
                aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                <motion.div
                  initial={false}
                  animate={todo.completed ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -45 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </motion.div>
              </motion.button>

              {/* Title */}
              <div className="flex-1 min-w-0 pt-1.5">
                <h3
                  className="text-sm font-semibold leading-snug transition-all duration-200"
                  style={{
                    color: todo.completed ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.90)",
                    textDecoration: todo.completed ? "line-through" : "none",
                    textDecorationColor: "rgba(255,255,255,0.25)",
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
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}
            >
              {todo.category ?? "personal"}
            </span>

            {todo.dueDate && (() => {
              try {
                const date = new Date(todo.dueDate)
                if (isNaN(date.getTime())) return null
                const isOverdue = date < new Date() && !todo.completed
                return (
                  <span
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
                    style={{
                      background: isOverdue ? "rgba(239,68,68,0.12)" : "rgba(56,189,248,0.10)",
                      color: isOverdue ? "#FCA5A5" : "#7DD3FC",
                      borderColor: isOverdue ? "rgba(239,68,68,0.25)" : "rgba(56,189,248,0.22)",
                    }}
                  >
                    <Calendar className="w-3 h-3" />
                    {date.toLocaleDateString()}
                  </span>
                )
              } catch { return null }
            })()}

            {todo.recurrenceType && todo.recurrenceType !== "none" && (
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
                style={{ background: "rgba(99,102,241,0.12)", color: "#A5B4FC", borderColor: "rgba(99,102,241,0.25)" }}
              >
                <Repeat className="w-3 h-3" />
                {(todo.recurrenceInterval ?? 1) > 1 ? `Every ${todo.recurrenceInterval} ` : ""}
                {todo.recurrenceType}
              </span>
            )}

            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.38)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <Clock className="w-3 h-3" />
              {(todo.status ?? (todo.completed ? "completed" : "pending")).replace("-", " ")}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <motion.button
              onClick={() => onEdit(todo)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="min-h-[36px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors duration-150"
              style={{
                background: "rgba(99,102,241,0.10)",
                color: "#A5B4FC",
                borderColor: "rgba(99,102,241,0.20)",
              }}
              aria-label="Edit task"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </motion.button>

            <motion.button
              onClick={() => onDelete(todo.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="min-h-[36px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors duration-150"
              style={{
                background: "rgba(239,68,68,0.10)",
                color: "#FCA5A5",
                borderColor: "rgba(239,68,68,0.22)",
              }}
              aria-label="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
