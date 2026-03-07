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
    <div className="min-h-screen pt-5 pb-2 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="px-1">
          <p className="text-[10px] font-bold text-white/28 uppercase tracking-widest mb-0.5">Calendar</p>
          <h1 className="text-xl font-black text-white">
            <span style={{
              background: "linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Task Calendar</span>
          </h1>
          <p className="text-xs text-white/40 mt-0.5">View tasks by due date</p>
        </div>

        {/* Calendar card */}
        <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(17,19,24,1) 100%)", boxShadow: "0 0 0 1px rgba(56,189,248,0.18)" }}>
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center active:scale-95 transition-transform">
              <ChevronLeft className="w-4 h-4 text-white/60" />
            </button>
            <h2 className="text-sm font-semibold text-white">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <button onClick={nextMonth} className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center active:scale-95 transition-transform">
              <ChevronRight className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-white/25 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="h-14" />

              const dateKey = getDateKey(day)
              const dayTodos = todosByDate[dateKey] || []
              const isToday = dateKey === todayStr
              const isOverdue = dateKey < todayStr && dayTodos.some((t) => !t.completed)
              const isSelected = dateKey === selectedDate

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                  className="h-14 p-1 rounded-xl text-left transition-all duration-150 active:scale-95 flex flex-col"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg,#4F46E5,#6366F1)"
                      : isToday
                        ? "rgba(99,102,241,0.15)"
                        : isOverdue
                          ? "rgba(244,63,94,0.10)"
                          : "rgba(255,255,255,0.03)",
                    boxShadow: isSelected
                      ? "0 0 0 1px rgba(99,102,241,0.4)"
                      : isToday
                        ? "0 0 0 1px rgba(99,102,241,0.22)"
                        : isOverdue
                          ? "0 0 0 1px rgba(244,63,94,0.18)"
                          : "0 0 0 1px rgba(255,255,255,0.04)",
                  }}
                >
                  <span
                    className="text-xs font-semibold leading-none"
                    style={{
                      color: isSelected ? "#fff"
                        : isToday ? "#818CF8"
                        : isOverdue ? "#FB7185"
                        : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {day}
                  </span>
                  {dayTodos.length > 0 && (
                    <span
                      className="mt-auto text-[9px] font-bold px-1 py-0.5 rounded-md self-start"
                      style={{
                        background: isOverdue ? "rgba(244,63,94,0.25)"
                          : isSelected ? "rgba(255,255,255,0.22)"
                          : "rgba(99,102,241,0.25)",
                        color: isSelected ? "#fff" : isOverdue ? "#FB7185" : "#818CF8",
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
          <div className="rounded-2xl p-4" style={{ background: "#111318", boxShadow: "0 0 0 1px rgba(99,102,241,0.18)" }}>
            <h3 className="text-sm font-semibold text-white/80 mb-3">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h3>
            {selectedTodos.length === 0 ? (
              <p className="text-white/35 text-xs">No tasks due on this date.</p>
            ) : (
              <div className="space-y-2">
                {selectedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{
                      background: todo.completed ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
                      borderColor: todo.completed ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <span className={`flex-1 text-sm ${todo.completed ? "line-through text-white/30" : "text-white/75"}`}>
                      {todo.title}
                    </span>
                    <PriorityBadge priority={todo.priority} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
