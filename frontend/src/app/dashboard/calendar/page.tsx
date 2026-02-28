"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { PriorityBadge } from "@/components/ui/priority-badge"
import { apiClient } from "@/lib/api"
import type { Todo } from "@/types/todo"

/**
 * CalendarView Page
 *
 * Monthly calendar grid showing task count badges per date.
 * Click on a date to expand and view tasks for that day.
 * Overdue tasks are highlighted in red.
 */

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [todos, setTodos] = useState<Todo[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [, setIsLoading] = useState(true)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    const load = async () => {
      try {
        const fetched = await apiClient.getTodos()
        setTodos(fetched)
      } catch {
        console.error("Failed to load todos for calendar")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Group todos by due date
  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {}
    todos.forEach((t) => {
      if (t.dueDate) {
        const dateKey = t.dueDate.split("T")[0]
        if (!map[dateKey]) map[dateKey] = []
        map[dateKey].push(t)
      }
    })
    return map
  }, [todos])

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []

    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)

    return days
  }, [year, month])

  const todayStr = new Date().toISOString().split("T")[0]

  const getDateKey = (day: number) => {
    const m = String(month + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${year}-${m}-${d}`
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const selectedTodos = selectedDate ? (todosByDate[selectedDate] || []) : []

  return (
    <div className="relative min-h-screen p-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Calendar</h1>
          <p className="text-slate-600 dark:text-slate-400">View your tasks by due date</p>
        </div>

        <GlassCard className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-teal-200 dark:border-teal-700">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="h-20" />
              }

              const dateKey = getDateKey(day)
              const dayTodos = todosByDate[dateKey] || []
              const isToday = dateKey === todayStr
              const isOverdue = dateKey < todayStr && dayTodos.some((t) => !t.completed)
              const isSelected = dateKey === selectedDate

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                  className={`h-20 p-1.5 rounded-lg text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-gradient-to-br from-blue-500 to-teal-500 text-white ring-2 ring-blue-300 transform scale-105"
                      : isToday
                        ? "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-600 dark:text-blue-300"
                        : isOverdue
                          ? "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-700 dark:text-red-300 hover:from-red-200 hover:to-red-300 dark:hover:from-red-800/50 dark:hover:to-red-700/50"
                          : "bg-white dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-teal-50 dark:hover:from-slate-600 dark:hover:to-slate-600 border border-slate-200 dark:border-slate-600"
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    isToday ? "text-blue-600 dark:text-blue-300 font-bold" :
                    isOverdue ? "text-red-600 dark:text-red-300 font-semibold" :
                    isSelected ? "text-white" : "text-slate-700 dark:text-slate-300"
                  }`}>
                    {day}
                  </span>
                  {dayTodos.length > 0 && (
                    <div className="mt-1">
                      <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        isOverdue
                          ? "bg-red-500 text-white"
                          : isSelected
                            ? "bg-white text-blue-600"
                            : "bg-gradient-to-r from-blue-500 to-teal-500 text-white"
                      }`}>
                        {dayTodos.length} task{dayTodos.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </GlassCard>

        {/* Selected Date Tasks */}
        {selectedDate && (
          <GlassCard className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-teal-200 dark:border-teal-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Tasks for {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric"
              })}
            </h3>
            {selectedTodos.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No tasks due on this date.</p>
            ) : (
              <div className="space-y-3">
                {selectedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      todo.completed
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800"
                        : "bg-gradient-to-r from-white to-blue-50 dark:from-slate-800 dark:to-slate-700/50 border-slate-200 dark:border-slate-600"
                    }`}
                  >
                    <span className={`flex-1 ${todo.completed ? "line-through opacity-50" : ""}`}>
                      {todo.title}
                    </span>
                    <PriorityBadge priority={todo.priority} />
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  )
}
