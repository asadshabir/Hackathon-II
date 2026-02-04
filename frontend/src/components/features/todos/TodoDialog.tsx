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
import type { Todo, TodoFormData, TodoPriority, TodoCategory } from "@/types/todo"

/**
 * TodoDialog Component
 *
 * Dialog for creating and editing todos
 * Clean design with solid colors and no heavy animations
 */

interface TodoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: TodoFormData) => void
  todo?: Todo
  mode: "create" | "edit"
}

export function TodoDialog({ open, onOpenChange, onSave, todo, mode }: TodoDialogProps) {
  const [formData, setFormData] = useState<TodoFormData>({
    title: "",
    description: "",
    priority: "medium",
    category: "personal",
    dueDate: "",
    reminderTime: "",
    reminderEnabled: false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TodoFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens/closes or todo changes
  useEffect(() => {
    if (open && todo && mode === "edit") {
      setFormData({
        title: todo.title,
        description: todo.description || "",
        priority: todo.priority,
        category: todo.category,
        dueDate: todo.dueDate || "",
        reminderTime: todo.reminderTime || "",
        reminderEnabled: todo.reminderEnabled || false,
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

    // Validate reminder time if reminder is enabled
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

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save todo:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof TodoFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleReminderToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, reminderEnabled: checked }))
    // Clear reminder time error when disabling
    if (!checked && errors.reminderTime) {
      setErrors((prev) => ({ ...prev, reminderTime: undefined }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === "create" ? "Create New Task" : "Edit Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border ${
                errors.title
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
              } text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors duration-150`}
              placeholder="Enter task title..."
              maxLength={100}
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-red-500 text-sm mt-1.5">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border ${
                errors.description
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
              } text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors duration-150 resize-none`}
              placeholder="Enter task description..."
              rows={3}
              maxLength={500}
            />
            {errors.description && (
              <p className="flex items-center gap-1 text-red-500 text-sm mt-1.5">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value as TodoPriority)}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value as TodoCategory)}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150"
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
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors duration-150"
            />
          </div>

          {/* Reminder */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                id="reminderEnabled"
                type="checkbox"
                checked={formData.reminderEnabled}
                onChange={(e) => handleReminderToggle(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 bg-slate-50 dark:bg-slate-800 cursor-pointer"
              />
              <label
                htmlFor="reminderEnabled"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
              >
                Enable Reminder Notification
              </label>
            </div>

            {formData.reminderEnabled && (
              <div>
                <label
                  htmlFor="reminderTime"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Reminder Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="reminderTime"
                  type="datetime-local"
                  value={formData.reminderTime}
                  onChange={(e) => handleChange("reminderTime", e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border ${
                    errors.reminderTime
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                  } text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-colors duration-150`}
                />
                {errors.reminderTime && (
                  <p className="flex items-center gap-1 text-red-500 text-sm mt-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errors.reminderTime}
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You&apos;ll receive a browser notification at this time
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? "Saving..." : mode === "create" ? "Create Task" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
