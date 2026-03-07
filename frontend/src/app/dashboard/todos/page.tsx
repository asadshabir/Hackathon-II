"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
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
 * TodoDashboard Page — AMOLED
 */

export default function TodoDashboard() {
  const { toast } = useToast()
  const { session } = useAuth()

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
      const rawTasks = (data.tasks as import("@/lib/api").Task[]) || []
      setTodos(rawTasks.map(t => apiClient.mapTaskToTodo(t)))
    } else if (event.type === "task.created") {
      if (data.recurrence_type && data.recurrence_type !== "none") {
        toast({
          title: "Recurring Task Created",
          description: `Next occurrence of "${data.title}" has been scheduled`,
        })
      }
      const normalized = apiClient.mapTaskToTodo(data as unknown as import("@/lib/api").Task)
      setTodos(prev => [normalized, ...prev])
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

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>()
  const notificationTimeouts = useRef<Map<string, number>>(new Map())

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
        if (dueDateFilter === "today") matchesDueDate = dueDateStr === todayStr
        else if (dueDateFilter === "this_week") matchesDueDate = dueDateStr >= todayStr && dueDateStr <= endOfWeekStr
        else if (dueDateFilter === "overdue") matchesDueDate = dueDateStr < todayStr && !todo.completed
      } else if (dueDateFilter !== "all" && !todo.dueDate) {
        matchesDueDate = false
      }

      return matchesSearch && matchesPriority && matchesCategory && matchesStatus && matchesDueDate
    })

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
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [todos, searchQuery, filterPriority, filterCategory, filterStatus, dueDateFilter, sortBy, sortOrder])

  const stats = useMemo(() => ({
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    pending: todos.filter((t) => !t.completed && t.status === "pending").length,
    inProgress: todos.filter((t) => t.status === "in-progress").length,
  }), [todos])

  const scheduleReminderForTodo = (todo: Todo) => {
    const existingTimeoutId = notificationTimeouts.current.get(todo.id)
    if (existingTimeoutId) {
      cancelScheduledNotification(existingTimeoutId)
      notificationTimeouts.current.delete(todo.id)
    }
    if (!todo.reminderEnabled || !todo.reminderTime || todo.completed) return
    const timeoutId = scheduleNotification(todo.reminderTime, todo.title, todo.description || "You have a task due soon!")
    if (timeoutId !== null) notificationTimeouts.current.set(todo.id, timeoutId)
  }

  const cancelReminderForTodo = (todoId: string) => {
    const timeoutId = notificationTimeouts.current.get(todoId)
    if (timeoutId) {
      cancelScheduledNotification(timeoutId)
      notificationTimeouts.current.delete(todoId)
    }
  }

  useEffect(() => {
    if (isLoading) return
    todos.forEach((todo) => {
      if (todo.reminderEnabled && todo.reminderTime && !todo.completed) scheduleReminderForTodo(todo)
    })
    return () => {
      notificationTimeouts.current.forEach((timeoutId) => cancelScheduledNotification(timeoutId))
      notificationTimeouts.current.clear()
    }
  }, [isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateTodo = async (formData: TodoFormData) => {
    try {
      if (formData.reminderEnabled && formData.reminderTime) {
        const permissionGranted = await requestPermissionWithUI()
        if (!permissionGranted) {
          formData.reminderEnabled = false
          formData.reminderTime = ""
          toast({ title: "Reminder Disabled", description: "Notification permission was denied. Task created without reminder.", variant: "destructive" })
        }
      }
      const todoForApi = { ...formData, status: "pending" as const, completed: false }
      const newTodo = await apiClient.createTodo(todoForApi)
      setTodos((prev) => [newTodo, ...prev])
      if (newTodo.reminderEnabled && newTodo.reminderTime) scheduleReminderForTodo(newTodo)
      toast({ title: "Success", description: formData.reminderEnabled ? "Task created with reminder" : "Task created successfully" })
    } catch (error) {
      console.error("Failed to create todo:", error)
      toast({ title: "Error", description: "Failed to create task. Please try again.", variant: "destructive" })
    }
  }

  const handleUpdateTodo = async (formData: TodoFormData) => {
    if (!editingTodo) return
    try {
      if (formData.reminderEnabled && formData.reminderTime && !editingTodo.reminderEnabled) {
        const permissionGranted = await requestPermissionWithUI()
        if (!permissionGranted) {
          formData.reminderEnabled = false
          formData.reminderTime = ""
          toast({ title: "Reminder Disabled", description: "Notification permission was denied.", variant: "destructive" })
        }
      }
      const updatedTodo = await apiClient.updateTodo(editingTodo.id, formData)
      setTodos((prev) => prev.map((todo) => (todo.id === editingTodo.id ? updatedTodo : todo)))
      if (updatedTodo.reminderEnabled && updatedTodo.reminderTime) scheduleReminderForTodo(updatedTodo)
      else cancelReminderForTodo(updatedTodo.id)
      toast({ title: "Success", description: "Task updated successfully" })
      setEditingTodo(undefined)
    } catch (error) {
      console.error("Failed to update todo:", error)
      toast({ title: "Error", description: "Failed to update task. Please try again.", variant: "destructive" })
    }
  }

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const willBeCompleted = !todo.completed
    try {
      const updatedTodo = await apiClient.toggleTodoCompletion(id, willBeCompleted)
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: willBeCompleted, status: willBeCompleted ? "completed" : "pending", updatedAt: updatedTodo.updatedAt } : t))
      if (willBeCompleted) cancelReminderForTodo(id)
      else if (todo.reminderEnabled && todo.reminderTime) scheduleReminderForTodo({ ...todo, completed: false })
      toast({ title: willBeCompleted ? "Task completed" : "Task reopened", description: willBeCompleted ? "Great job!" : "Keep going!" })
    } catch (error) {
      console.error("Failed to toggle todo:", error)
      toast({ title: "Error", description: "Failed to update task status.", variant: "destructive" })
    }
  }

  const handleDeleteTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (confirm("Are you sure you want to delete \"" + (todo?.title || "") + "\"?")) {
      try {
        cancelReminderForTodo(id)
        await apiClient.deleteTodo(id)
        setTodos((prev) => prev.filter((todo) => todo.id !== id))
        toast({ title: "Deleted", description: "Task deleted successfully", variant: "destructive" })
      } catch (error) {
        console.error("Failed to delete todo:", error)
        toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" })
      }
    }
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setDialogMode("edit")
    setDialogOpen(true)
  }

  const handleOpenCreateDialog = () => {
    setEditingTodo(undefined)
    setDialogMode("create")
    setDialogOpen(true)
  }

  const handleDialogSave = (formData: TodoFormData) => {
    if (dialogMode === "create") handleCreateTodo(formData)
    else handleUpdateTodo(formData)
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: "#6366F1", borderRightColor: "rgba(99,102,241,0.25)" }}
          />
          <p className="text-white/40 text-sm">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen pt-5 pb-2 animate-fade-in">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Header */}
          <div className="px-1">
            <p className="text-[10px] font-bold text-white/28 uppercase tracking-widest mb-0.5">Tasks</p>
            <h1 className="text-xl font-black text-white leading-tight">
              <span style={{
                background: "linear-gradient(135deg, #34D399 0%, #38BDF8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Your Tasks</span>
            </h1>
            <p className="text-xs text-white/40 mt-0.5">Manage your todos with style and efficiency</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatsCard title="Total"   value={stats.total}      icon={TrendingUp}  accentColor="#818CF8" gradientFrom="rgba(129,140,248,0.18)" gradientTo="rgba(99,102,241,0.04)" />
            <StatsCard title="Done"    value={stats.completed}  icon={CheckCircle} accentColor="#34D399" gradientFrom="rgba(52,211,153,0.18)"  gradientTo="rgba(16,185,129,0.04)" />
            <StatsCard title="Active"  value={stats.inProgress} icon={Clock}       accentColor="#38BDF8" gradientFrom="rgba(56,189,248,0.18)"  gradientTo="rgba(6,182,212,0.04)"  />
            <StatsCard title="Pending" value={stats.pending}    icon={AlertCircle} accentColor="#FBBF24" gradientFrom="rgba(251,191,36,0.18)"  gradientTo="rgba(245,158,11,0.04)" />
          </div>

          {/* Controls */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(17,19,24,1) 100%)",
              boxShadow: "0 0 0 1px rgba(99,102,241,0.15)",
            }}
          >
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={filteredTodos.length}
            />

            <div className="flex flex-col sm:flex-row gap-3">
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

              <div className="flex gap-2">
                <SortSelector
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onChange={(newSortBy, newSortOrder) => {
                    setSortBy(newSortBy)
                    setSortOrder(newSortOrder)
                  }}
                />
                <AnimatedButton variant="primary" className="whitespace-nowrap" onClick={handleOpenCreateDialog}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Task
                </AnimatedButton>
              </div>
            </div>
          </div>

          {/* Todo List */}
          <div className="space-y-3">
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
                  className="rounded-2xl p-10 text-center"
                  style={{ background: "#111318", boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}
                >
                  <p className="text-white/35 text-sm">
                    {searchQuery || filterPriority !== "all" || filterCategory !== "all" || filterStatus !== "all"
                      ? "No tasks match your filters"
                      : "No tasks yet — create your first task!"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

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
