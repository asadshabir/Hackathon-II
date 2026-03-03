"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RecurrenceSelector } from "@/components/ui/recurrence-selector"
import type { Todo, TodoFormData, TodoPriority, TodoCategory } from "@/types/todo"

/**
 * TodoDialog Component
 *
 * AMOLED dialog for creating and editing todos
 */

interface TodoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: TodoFormData) => void
  todo?: Todo
  mode: "create" | "edit"
}

const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all duration-150 focus:ring-1"
const inputStyle = {
  background: "#1A1A1A",
  border: "1px solid rgba(255,255,255,0.08)",
}
const inputFocusRing = "focus:ring-violet-500/40"
const labelClass = "block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2"

export function TodoDialog({ open, onOpenChange, onSave, todo, mode }: TodoDialogProps) {
  const [formData, setFormData] = useState<TodoFormData>({
    title: "",
    description: "",
    priority: "medium",
    category: "personal",
    dueDate: "",
    reminderTime: "",
    reminderEnabled: false,
    recurrenceType: "none",
    recurrenceInterval: 1,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TodoFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && todo && mode === "edit") {
      const dueDateValue = todo.dueDate ? todo.dueDate.split("T")[0] : ""
      const reminderValue = todo.reminderTime ? todo.reminderTime.slice(0, 16) : ""
      setFormData({
        title: todo.title,
        description: todo.description || "",
        priority: todo.priority,
        category: todo.category,
        dueDate: dueDateValue,
        reminderTime: reminderValue,
        reminderEnabled: todo.reminderEnabled || false,
        recurrenceType: todo.recurrenceType || "none",
        recurrenceInterval: todo.recurrenceInterval || 1,
      })
    } else if (open && mode === "create") {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        category: "personal",
        dueDate: "",
        reminderTime: "",
        reminderEnabled: false,
        recurrenceType: "none",
        recurrenceInterval: 1,
      })
    }
    setErrors({})
  }, [open, todo, mode])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TodoFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters"
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    if (formData.reminderEnabled) {
      if (!formData.reminderTime) {
        newErrors.reminderTime = "Reminder time is required when reminder is enabled"
      } else {
        const reminderDate = new Date(formData.reminderTime)
        const now = new Date()
        if (reminderDate <= now) {
          newErrors.reminderTime = "Reminder time must be in the future"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save todo:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof TodoFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof TodoFormData]) {
      setErrors((prev) => ({ ...prev, [field as keyof TodoFormData]: undefined }))
    }
  }

  const handleReminderToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, reminderEnabled: checked }))
    if (!checked && errors.reminderTime) {
      setErrors((prev) => ({ ...prev, reminderTime: undefined }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] border-0"
        style={{ background: "#0D0D0D", boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.8)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">
            {mode === "create" ? "Create New Task" : "Edit Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className={labelClass}>
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`${inputClass} ${inputFocusRing} ${errors.title ? "focus:ring-rose-500/40" : ""}`}
              style={{
                ...inputStyle,
                borderColor: errors.title ? "rgba(244,63,94,0.5)" : "rgba(255,255,255,0.08)",
              }}
              placeholder="Enter task title..."
              maxLength={100}
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-rose-400 text-xs mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`${inputClass} ${inputFocusRing} resize-none`}
              style={inputStyle}
              placeholder="Enter task description..."
              rows={3}
              maxLength={500}
            />
            {errors.description && (
              <p className="flex items-center gap-1 text-rose-400 text-xs mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="priority" className={labelClass}>Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value as TodoPriority)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className={labelClass}>Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value as TodoCategory)}
                className={`${inputClass} ${inputFocusRing}`}
                style={inputStyle}
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="shopping">Shopping</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className={labelClass}>Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              className={`${inputClass} ${inputFocusRing}`}
              style={inputStyle}
            />
          </div>

          {/* Recurrence */}
          <div>
            <label htmlFor="recurrenceType" className={labelClass}>Recurrence</label>
            <RecurrenceSelector
              recurrenceType={formData.recurrenceType || "none"}
              recurrenceInterval={formData.recurrenceInterval || 1}
              onTypeChange={(type) => handleChange("recurrenceType", type)}
              onIntervalChange={(interval) => setFormData(prev => ({ ...prev, recurrenceInterval: interval }))}
            />
          </div>

          {/* Reminder */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="relative w-5 h-5 rounded flex items-center justify-center cursor-pointer"
                style={{
                  background: formData.reminderEnabled ? "linear-gradient(135deg,#7C3AED,#8B5CF6)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${formData.reminderEnabled ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.12)"}`,
                }}
                onClick={() => handleReminderToggle(!formData.reminderEnabled)}
              >
                {formData.reminderEnabled && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <input
                  id="reminderEnabled"
                  type="checkbox"
                  checked={formData.reminderEnabled}
                  onChange={(e) => handleReminderToggle(e.target.checked)}
                  className="sr-only"
                />
              </div>
              <label
                htmlFor="reminderEnabled"
                className="text-sm text-white/60 cursor-pointer select-none"
              >
                Enable Reminder Notification
              </label>
            </div>

            {formData.reminderEnabled && (
              <div>
                <label htmlFor="reminderTime" className={labelClass}>
                  Reminder Time <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reminderTime"
                  type="datetime-local"
                  value={formData.reminderTime}
                  onChange={(e) => handleChange("reminderTime", e.target.value)}
                  className={`${inputClass} ${inputFocusRing}`}
                  style={{
                    ...inputStyle,
                    borderColor: errors.reminderTime ? "rgba(244,63,94,0.5)" : "rgba(255,255,255,0.08)",
                  }}
                />
                {errors.reminderTime && (
                  <p className="flex items-center gap-1 text-rose-400 text-xs mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.reminderTime}
                  </p>
                )}
                <p className="text-xs text-white/25 mt-1">
                  You&apos;ll receive a browser notification at this time
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-white/10 bg-white/[0.05] text-white/60 hover:bg-white/[0.08]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px] text-white border-0"
              style={{ background: "linear-gradient(135deg,#7C3AED,#8B5CF6)" }}
            >
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Task" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
