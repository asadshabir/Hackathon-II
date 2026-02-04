"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, Search, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { GlassCard } from "@/components/ui/glass-card"
import { TodoCard } from "@/components/features/todos/TodoCard"
import { StatsCard } from "@/components/features/todos/StatsCard"
import { TodoDialog } from "@/components/features/todos/TodoDialog"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import {
  requestPermissionWithUI,
  scheduleNotification,
  cancelScheduledNotification,
} from "@/lib/notifications"
import type { Todo, TodoPriority, TodoCategory, TodoFormData } from "@/types/todo"

/**
 * TodoDashboard Page
 *
 * Advanced todo management dashboard with clean UI, filters, search, and statistics
 * Features: Full CRUD operations, API persistence, toast notifications
 */

export default function TodoDashboard() {
  const { toast } = useToast()

  // State
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState<TodoPriority | "all">("all")
  const [filterCategory, setFilterCategory] = useState<TodoCategory | "all">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "active">("all")

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>()

  // Notification timeout IDs (todoId -> timeoutId)
  const notificationTimeouts = useRef<Map<string, number>>(new Map())

  // Load todos from API on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const fetchedTodos = await apiClient.getTodos()
        setTodos(fetchedTodos)
      } catch (error) {
        console.error("Failed to load todos:", error)
        toast({
          title: "Error",
          description: "Failed to load todos from server",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTodos()
  }, [toast])

  // Filter and search todos
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPriority = filterPriority === "all" || todo.priority === filterPriority
      const matchesCategory = filterCategory === "all" || todo.category === filterCategory
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "completed" && todo.completed) ||
        (filterStatus === "active" && !todo.completed)

      return matchesSearch && matchesPriority && matchesCategory && matchesStatus
    })
  }, [todos, searchQuery, filterPriority, filterCategory, filterStatus])

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: todos.length,
      completed: todos.filter((t) => t.completed).length,
      pending: todos.filter((t) => !t.completed && t.status === "pending").length,
      inProgress: todos.filter((t) => t.status === "in-progress").length,
    }
  }, [todos])

  // Notification Management

  /**
   * Schedule a notification for a todo
   */
  const scheduleReminderForTodo = (todo: Todo) => {
    // Cancel existing notification if any
    const existingTimeoutId = notificationTimeouts.current.get(todo.id)
    if (existingTimeoutId) {
      cancelScheduledNotification(existingTimeoutId)
      notificationTimeouts.current.delete(todo.id)
    }

    // Only schedule if reminder is enabled and todo is not completed
    if (!todo.reminderEnabled || !todo.reminderTime || todo.completed) {
      return
    }

    // Schedule the notification
    const timeoutId = scheduleNotification(
      todo.reminderTime,
      todo.title,
      todo.description || "You have a task due soon!"
    )

    if (timeoutId !== null) {
      notificationTimeouts.current.set(todo.id, timeoutId)
    }
  }

  /**
   * Cancel a scheduled notification for a todo
   */
  const cancelReminderForTodo = (todoId: string) => {
    const timeoutId = notificationTimeouts.current.get(todoId)
    if (timeoutId) {
      cancelScheduledNotification(timeoutId)
      notificationTimeouts.current.delete(todoId)
    }
  }

  /**
   * Schedule notifications for all todos on mount
   */
  useEffect(() => {
    if (isLoading) return

    // Schedule reminders for all active todos
    todos.forEach((todo) => {
      if (todo.reminderEnabled && todo.reminderTime && !todo.completed) {
        scheduleReminderForTodo(todo)
      }
    })

    // Cleanup: cancel all notifications when component unmounts
    return () => {
      notificationTimeouts.current.forEach((timeoutId) => {
        cancelScheduledNotification(timeoutId)
      })
      notificationTimeouts.current.clear()
    }
  }, [isLoading]) // Only run once when loading completes

  // CRUD Operations

  /**
   * Create a new todo
   */
  const handleCreateTodo = async (formData: TodoFormData) => {
    try {
      // Request notification permission if reminder is enabled
      if (formData.reminderEnabled && formData.reminderTime) {
        const permissionGranted = await requestPermissionWithUI()
        if (!permissionGranted) {
          // User denied permission, disable reminder
          formData.reminderEnabled = false
          formData.reminderTime = ""
          toast({
            title: "Reminder Disabled",
            description: "Notification permission was denied. Task created without reminder.",
            variant: "destructive",
          })
        }
      }

      // Transform TodoFormData to API format
      const todoForApi = {
        ...formData,
        status: "pending" as const,
        completed: false,
      };

      // Create todo via API
      const newTodo = await apiClient.createTodo(todoForApi)

      // Update local state
      setTodos((prev) => [newTodo, ...prev])

      // Schedule notification if reminder is enabled
      if (newTodo.reminderEnabled && newTodo.reminderTime) {
        scheduleReminderForTodo(newTodo)
      }

      toast({
        title: "Success",
        description: formData.reminderEnabled
          ? "Task created with reminder notification"
          : "Task created successfully",
      })
    } catch (error) {
      console.error("Failed to create todo:", error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  /**
   * Update an existing todo
   */
  const handleUpdateTodo = async (formData: TodoFormData) => {
    if (!editingTodo) return

    try {
      // Request notification permission if reminder is newly enabled
      if (formData.reminderEnabled && formData.reminderTime && !editingTodo.reminderEnabled) {
        const permissionGranted = await requestPermissionWithUI()
        if (!permissionGranted) {
          formData.reminderEnabled = false
          formData.reminderTime = ""
          toast({
            title: "Reminder Disabled",
            description: "Notification permission was denied. Task updated without reminder.",
            variant: "destructive",
          })
        }
      }

      // Update todo via API
      const updatedTodo = await apiClient.updateTodo(editingTodo.id, formData)

      // Update local state
      setTodos((prev) =>
        prev.map((todo) => (todo.id === editingTodo.id ? updatedTodo : todo))
      )

      // Re-schedule notification
      if (updatedTodo.reminderEnabled && updatedTodo.reminderTime) {
        scheduleReminderForTodo(updatedTodo)
      } else {
        // Cancel reminder if disabled
        cancelReminderForTodo(updatedTodo.id)
      }

      toast({
        title: "Success",
        description: formData.reminderEnabled
          ? "Task updated with reminder notification"
          : "Task updated successfully",
      })

      setEditingTodo(undefined)
    } catch (error) {
      console.error("Failed to update todo:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  /**
   * Toggle todo completion status
   */
  const handleToggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    const willBeCompleted = !todo.completed

    try {
      // Update todo via API
      const updatedTodo = await apiClient.toggleTodoCompletion(id, willBeCompleted)

      // Update local state
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                completed: willBeCompleted,
                status: willBeCompleted ? "completed" : "pending",
                updatedAt: updatedTodo.updatedAt,
              }
            : t
        )
      )

      // Cancel reminder when completing a task, re-schedule when reopening
      if (willBeCompleted) {
        cancelReminderForTodo(id)
      } else if (todo.reminderEnabled && todo.reminderTime) {
        scheduleReminderForTodo({ ...todo, completed: false }) // Use original todo but with completed = false
      }

      toast({
        title: willBeCompleted ? "Task completed" : "Task reopened",
        description: willBeCompleted ? "Great job!" : "Keep going!",
      })
    } catch (error) {
      console.error("Failed to toggle todo:", error)
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
    }
  }

  /**
   * Delete a todo
   */
  const handleDeleteTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id)

    if (confirm("Are you sure you want to delete \"" + (todo?.title || "") + "\"?")) {
      try {
        // Cancel any scheduled reminder
        cancelReminderForTodo(id)

        // Delete todo via API
        await apiClient.deleteTodo(id)

        // Update local state
        setTodos((prev) => prev.filter((todo) => todo.id !== id))

        toast({
          title: "Deleted",
          description: "Task deleted successfully",
          variant: "destructive",
        })
      } catch (error) {
        console.error("Failed to delete todo:", error)
        toast({
          title: "Error",
          description: "Failed to delete task. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  /**
   * Open edit dialog
   */
  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setDialogMode("edit")
    setDialogOpen(true)
  }

  /**
   * Open create dialog
   */
  const handleOpenCreateDialog = () => {
    setEditingTodo(undefined)
    setDialogMode("create")
    setDialogOpen(true)
  }

  /**
   * Handle dialog save
   */
  const handleDialogSave = (formData: TodoFormData) => {
    if (dialogMode === "create") {
      handleCreateTodo(formData)
    } else {
      handleUpdateTodo(formData)
    }
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Your Tasks</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Manage your todos with style and efficiency</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Tasks" value={stats.total} icon={TrendingUp} gradient="from-indigo-500 to-indigo-600" accentBorder="bg-indigo-500" />
            <StatsCard title="Completed" value={stats.completed} icon={CheckCircle} gradient="from-green-500 to-emerald-500" accentBorder="bg-emerald-500" />
            <StatsCard title="In Progress" value={stats.inProgress} icon={Clock} gradient="from-blue-500 to-cyan-500" accentBorder="bg-cyan-500" />
            <StatsCard title="Pending" value={stats.pending} icon={AlertCircle} gradient="from-yellow-500 to-orange-500" accentBorder="bg-orange-500" />
          </div>

          {/* Controls */}
          <div>
            <GlassCard className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as TodoPriority | "all")}
                    className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none min-w-[140px]"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as TodoCategory | "all")}
                    className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none min-w-[140px]"
                  >
                    <option value="all">All Categories</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="shopping">Shopping</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as "all" | "completed" | "active")}
                    className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none transition-colors appearance-none min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Add Button */}
                <AnimatedButton variant="primary" className="whitespace-nowrap" onClick={handleOpenCreateDialog}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Task
                </AnimatedButton>
              </div>
            </GlassCard>
          </div>

          {/* Todo List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTodos.length > 0 ? (
                filteredTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggleTodo}
                    onDelete={handleDeleteTodo}
                    onEdit={handleEditTodo}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <GlassCard className="p-12 text-center">
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      {searchQuery || filterPriority !== "all" || filterCategory !== "all" || filterStatus !== "all"
                        ? "No tasks match your filters"
                        : "No tasks yet. Create your first task!"}
                    </p>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Todo Dialog */}
      <TodoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleDialogSave}
        todo={editingTodo}
        mode={dialogMode}
      />
    </>
  )
}
