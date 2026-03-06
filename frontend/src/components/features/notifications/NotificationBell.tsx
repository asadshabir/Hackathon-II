"use client"

import { useState, useEffect } from "react"
import { Bell, X, CheckCircle, AlertTriangle } from "lucide-react"

interface Notification {
  id: string
  type: "reminder" | "deadline" | "overdue" | "milestone" | "achievement"
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className = "" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "reminder",
      title: "Task Reminder",
      message: "Complete project proposal is due in 1 hour",
      timestamp: "2026-02-09T10:30:00Z",
      read: false,
    },
    {
      id: "2",
      type: "deadline",
      title: "Deadline Approaching",
      message: "Submit quarterly report in 24 hours",
      timestamp: "2026-02-09T09:15:00Z",
      read: false,
    },
  ])

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }
  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reminder":    return <Bell className="w-4 h-4 text-indigo-400" />
      case "deadline":    return <AlertTriangle className="w-4 h-4 text-amber-400" />
      case "achievement": return <CheckCircle className="w-4 h-4 text-emerald-400" />
      default:            return <Bell className="w-4 h-4 text-white/40" />
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors hover:bg-white/[0.05]"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white/50" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-indigo-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-2xl z-50 overflow-hidden"
          style={{
            background: "#111318",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 16px 48px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-white/35 text-sm">No notifications</div>
            ) : (
              <div>
                {notifications.map((n, i) => (
                  <div
                    key={n.id}
                    className="px-4 py-3"
                    style={{
                      borderBottom: i < notifications.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      background: !n.read ? "rgba(99,102,241,0.05)" : "transparent",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getTypeIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-medium text-white/85 truncate">{n.title}</h4>
                          <button onClick={() => clearNotification(n.id)} className="text-white/25 hover:text-white/60 transition-colors shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{n.message}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-[10px] text-white/25">{new Date(n.timestamp).toLocaleString()}</p>
                          {!n.read && (
                            <button onClick={() => markAsRead(n.id)} className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
