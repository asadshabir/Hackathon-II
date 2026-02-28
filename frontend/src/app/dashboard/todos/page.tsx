"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { GlassCard } from "@/components/ui/glass-card"
import { TodoCard } from "@/components/features/todos/TodoCard"
import { StatsCard } from "@/components/features/todos/StatsCard"
import { TodoDialog } from "@/components/features/todos/TodoDialog"
import { SearchBar } from "@/components/features/search/SearchBar"
import { FilterPanel } from "@/components/features/search/FilterPanel"
import { SortSelector } from "@/components/features/search/SortSelector"
import { useToast } from "@/hooks/use-toast"
import { useWebSocket } from "@/hooks/useWebSocket"
import { useAuth } from "@/hooks/useAuth"
import { apiClient } from "@/lib/api"
import {
  requestPermissionWithUI,
  scheduleNotification,
  cancelScheduledNotification,
} from "@/lib/notifications"
import type { Todo, TodoPriority, TodoCategory, TodoFormData } from "@/types/todo"
import type { WebSocketEvent } from "@/hooks/useWebSocket"

/**
 * TodoDashboard Page
 *
 * Advanced todo management dashboard with clean UI, filters, search, and statistics
 * Features: Full CRUD operations, API persistence, toast notifications
 */

export default function TodoDashboard() {
  const { toast } = useToast()
  const { session } = useAuth()

  // State
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState<TodoPriority | "all">("all")
  const [filterCategory, setFilterCategory] = useState<TodoCategory | "all">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "active">("all")
  const [sortBy, setSortBy] = useState<"created_at" | "priority" | "due_date" | "title">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [dueDateFilter, setDueDateFilter] = useState<"all" | "today" | "this_week" | "overdue">("all")

  // WebSocket real-time sync
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    const data = event.data as Record<string, unknown> | undefined
    if (!data) return

    if (event.type === "full_state_snapshot") {
      const tasks = (data.tasks as Todo[]) || []
      setTodos(tasks)
    } else if (event.type === "task.created") {
      if (data.recurrence_type && data.recurrence_type !== "none") {
        toast({
          title: "Recurring Task Created",
          description: `Next occurrence of "${data.title}" has been scheduled`,
        })
      }
      setTodos(prev => [data as unknown as Todo, ...prev])
    } else if (event.type === "task.updated") {
      const taskId = data.task_id as string
      const after = data.after as Record<string, unknown> | undefined
      if (after) {
        setTodos(prev =>
          prev.map(t => t.id === taskId ? { ...t, ...after } as Todo : t)
        )
      }
    } else if (event.type === "task.completed") {
      const taskId = data.task_id as string
      setTodos((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: true, status: "completed" as const } : t
        )
      )
    } else if (event.type === "task.deleted") {
      const taskId = data.task_id as string
      setTodos((prev) => prev.filter((t) => t.id !== taskId))
    } else if (event.type === "notification.sent") {
      toast({
        title: "Notification",
        description: data.message as string,
      })
    }
  }, [toast])

  useWebSocket({
    userId: session?.user?.id ?? null,
    onEvent: handleWebSocketEvent,
    enabled: !!session?.user?.id,
  })

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
    const now = new Date()
    const todayStr = now.toISOString().split("T")[0]
    const endOfWeek = new Date(now)
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
    const endOfWeekStr = endOfWeek.toISOString().split("T")[0]

    const filtered = todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPriority = filterPriority === "all" || todo.priority === filterPriority
      const matchesCategory = filterCategory === "all" || todo.category === filterCategory
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "completed" && todo.completed) ||
        (filterStatus === "active" && !todo.completed)

      let matchesDueDate = true
      if (dueDateFilter !== "all" && todo.dueDate) {
        const dueDateStr = todo.dueDate.split("T")[0]
        if (dueDateFilter === "today") {
          matchesDueDate = dueDateStr === todayStr
        } else if (dueDateFilter === "this_week") {
          matchesDueDate = dueDateStr >= todayStr && dueDateStr <= endOfWeekStr
        } else if (dueDateFilter === "overdue") {
          matchesDueDate = dueDateStr < todayStr && !todo.completed
        }
      } else if (dueDateFilter !== "all" && !todo.dueDate) {
        matchesDueDate = false
      }

      return matchesSearch && matchesPriority && matchesCategory && matchesStatus && matchesDueDate
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      if (sortBy === "priority") {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
      } else if (sortBy === "due_date") {
        if (!a.dueDate && !b.dueDate) comparison = 0
        else if (!a.dueDate) comparison = sortOrder === "asc" ? 1 : -1
        else if (!b.dueDate) comparison = sortOrder === "asc" ? -1 : 1
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      } else if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title)
      } else { // created_at
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [todos, searchQuery, filterPriority, filterCategory, filterStatus, dueDateFilter, sortBy, sortOrder])

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
              <div className="space-y-4">
                {/* Search Bar */}
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  resultCount={filteredTodos.length}
                  className="lg:max-w-md"
                />

                {/* Filters and Sort */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <FilterPanel
                      filters={{
                        priority: filterPriority,
                        category: filterCategory,
                        status: filterStatus,
                        dueDateFilter: dueDateFilter,
                      }}
                      onFilterChange={(key, value) => {
                        if (key === "priority") setFilterPriority(value as TodoPriority | "all")
                        else if (key === "category") setFilterCategory(value as TodoCategory | "all")
                        else if (key === "status") setFilterStatus(value as "all" | "completed" | "active")
                        else if (key === "dueDateFilter") setDueDateFilter(value as "all" | "today" | "this_week" | "overdue")
                      }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <SortSelector
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onChange={(newSortBy, newSortOrder) => {
                        setSortBy(newSortBy)
                        setSortOrder(newSortOrder)
                      }}
                    />

                    {/* Add Button */}
                    <AnimatedButton variant="primary" className="whitespace-nowrap" onClick={handleOpenCreateDialog}>
                      <Plus className="w-5 h-5 mr-2" />
                      Add Task
                    </AnimatedButton>
                  </div>
                </div>
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
