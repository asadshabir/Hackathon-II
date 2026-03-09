"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
    <div className="min-h-screen pt-5 pb-6 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8 px-4">

        {/* Header */}
        <div className="text-center">
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2">TaskFlow Calendar</p>
          <h1 className="text-3xl font-black text-white mb-3">
            <span style={{
              background: "linear-gradient(135deg, #00e6b3 0%, #6366F1 30%, #8B5CF6 60%, #EC4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>TaskFlow Calendar</span>
          </h1>
          <p className="text-sm text-white/60 max-w-md mx-auto">View tasks by due date with beautiful visual indicators</p>
        </div>

        {/* Calendar card */}
        <div className="rounded-3xl p-6" style={{
          background: "linear-gradient(145deg, #0f172a 0%, #1e293b 30%, #111827 100%)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(99, 102, 241, 0.1)",
          backdropFilter: "blur(10px)"
        }}>
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all duration-200 hover:bg-indigo-500/20"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)",
                boxShadow: "0 0 0 1px rgba(99,102,241,0.2)"
              }}
            >
              <ChevronLeft className="w-5 h-5 text-indigo-300" />
            </button>
            <h2 className="text-lg font-bold text-white px-4 py-2 rounded-xl" style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)",
              boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.2)"
            }}>
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-all duration-200 hover:bg-indigo-500/20"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)",
                boxShadow: "0 0 0 1px rgba(99,102,241,0.2)"
              }}
            >
              <ChevronRight className="w-5 h-5 text-indigo-300" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {DAYS.map((d, index) => (
              <div
                key={d}
                className="text-center text-xs font-bold py-2 rounded-lg"
                style={{
                  background: index === 0 || index === 6
                    ? "linear-gradient(135deg, rgba(244,63,94,0.15) 0%, rgba(249,115,22,0.15) 100%)"
                    : "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)",
                  boxShadow: index === 0 || index === 6
                    ? "0 0 0 1px rgba(244,63,94,0.3)"
                    : "0 0 0 1px rgba(99,102,241,0.2)"
                }}
              >
                <span className={index === 0 || index === 6 ? "text-rose-400" : "text-indigo-300"}>
                  {d}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-3">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="h-20" />

              const dateKey = getDateKey(day)
              const dayTodos = todosByDate[dateKey] || []
              const isToday = dateKey === todayStr
              const isOverdue = dateKey < todayStr && dayTodos.some((t) => !t.completed)
              const isSelected = dateKey === selectedDate

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                  className="h-20 p-2 rounded-2xl text-left transition-all duration-300 active:scale-95 flex flex-col group hover:scale-[1.03]"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)"
                      : isToday
                        ? "radial-gradient(circle at 30% 30%, #6366F1, transparent 70%), linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)"
                        : isOverdue
                          ? "radial-gradient(circle at 30% 30%, #F43F5E, transparent 70%), linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(249,115,22,0.15) 100%)"
                          : dayTodos.length > 0
                            ? "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)"
                            : "linear-gradient(135deg, rgba(30,41,59,0.6) 0%, rgba(15,23,42,0.8) 100%)",
                    boxShadow: isSelected
                      ? "0 8px 20px rgba(99,102,241,0.3), 0 0 0 2px rgba(99,102,241,0.4)"
                      : isToday
                        ? "0 4px 15px rgba(99,102,241,0.2), 0 0 0 1px rgba(99,102,241,0.3)"
                        : isOverdue
                          ? "0 4px 15px rgba(244,63,94,0.2), 0 0 0 1px rgba(244,63,94,0.3)"
                          : dayTodos.length > 0
                            ? "0 2px 8px rgba(99,102,241,0.1), 0 0 0 1px rgba(99,102,241,0.15)"
                            : "0 2px 6px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    className="text-sm font-bold leading-none"
                    style={{
                      color: isSelected ? "#fff"
                        : isToday ? "#818CF8"
                        : isOverdue ? "#FB7185"
                        : dayTodos.length > 0 ? "#C7D2FE" : "rgba(255,255,255,0.7)",
                      textShadow: isSelected ? "0 0 8px rgba(0,0,0,0.5)" : "none",
                    }}
                  >
                    {day}
                  </span>
                  {dayTodos.length > 0 && (
                    <span
                      className="mt-auto text-[10px] font-bold px-2 py-1 rounded-full self-center"
                      style={{
                        background: isSelected
                          ? "rgba(255,255,255,0.25)"
                          : isOverdue
                            ? "radial-gradient(circle, rgba(244,63,94,0.4) 0%, rgba(244,63,94,0.2) 70%)"
                            : "radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(99,102,241,0.2) 70%)",
                        boxShadow: isSelected
                          ? "0 0 8px rgba(255,255,255,0.2)"
                          : isOverdue
                            ? "0 0 8px rgba(244,63,94,0.3)"
                            : "0 0 8px rgba(99,102,241,0.2)",
                        backdropFilter: "blur(4px)",
                        color: isSelected ? "#fff" : isOverdue ? "#FECACA" : "#C7D2FE",
                      }}
                    >
                      {dayTodos.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected date tasks */}
        {selectedDate && (
          <div className="rounded-3xl p-6" style={{
            background: "linear-gradient(145deg, #111827 0%, #1e293b 30%, #0f172a 100%)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(99, 102, 241, 0.1)",
            backdropFilter: "blur(10px)"
          }}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-bold text-white">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h3>
              <span className="text-sm font-bold px-3 py-1 rounded-full" style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)",
                boxShadow: "0 0 8px rgba(99,102,241,0.2)",
                color: "#C7D2FE"
              }}>
                {selectedTodos.length} tasks
              </span>
            </div>
            {selectedTodos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/40 text-base">No tasks due on this date.</p>
                <p className="text-white/30 text-sm mt-1">Enjoy your free time! 🌟</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedTodos.map((todo) => {
                  const isTodoOverdue = todo.dueDate ? new Date(todo.dueDate) < new Date() && !todo.completed : false;
                  const isTodoToday = todo.dueDate ? new Date(todo.dueDate).toDateString() === new Date().toDateString() : false;

                  return (
                  <div
                    key={todo.id}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{
                      background: todo.completed
                        ? "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(34,197,94,0.1) 100%)"
                        : isTodoOverdue
                          ? "linear-gradient(135deg, rgba(244,63,94,0.15) 0%, rgba(249,115,22,0.1) 100%)"
                          : isTodoToday
                            ? "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)"
                            : "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.08) 100%)",
                      boxShadow: todo.completed
                        ? "0 0 0 1px rgba(16,185,129,0.2)"
                        : isTodoOverdue
                          ? "0 0 0 1px rgba(244,63,94,0.2)"
                          : isTodoToday
                            ? "0 0 0 1px rgba(99,102,241,0.25)"
                            : "0 0 0 1px rgba(99,102,241,0.15)"
                    }}
                  >
                    <div className="flex-1">
                      <span className={`text-base font-medium ${todo.completed ? "line-through text-white/40" : "text-white/90"}`}>
                        {todo.title}
                      </span>
                      {todo.description && (
                        <p className={`text-sm mt-1 ${todo.completed ? "line-through text-white/30" : "text-white/50"}`}>
                          {todo.description}
                        </p>
                      )}
                    </div>
                    <PriorityBadge priority={todo.priority} />
                  </div>
                )})}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
