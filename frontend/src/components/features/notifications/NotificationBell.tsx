"use client"

import { useState, useEffect } from "react"
import { Bell, X, CheckCircle, AlertTriangle } from "lucide-react"

/**
 * NotificationBell Component
 *
 * Bell icon with unread count badge, dropdown panel with recent notifications, mark-as-read functionality
 */

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
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? {...n, read: true} : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})))
  }

  const clearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reminder": return <Bell className="w-4 h-4 text-blue-500" />
      case "deadline": return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "achievement": return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 ${!notification.read ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      {getTypeIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => clearNotification(notification.id)}
                            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                          {notification.message}
                        </p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}