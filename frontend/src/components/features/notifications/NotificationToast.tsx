"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

/**
 * NotificationToast Component
 *
 * Toast notification for reminder.due events via WebSocket
 */

interface NotificationToastProps {
  message: string
  type?: "info" | "success" | "warning" | "error"
  duration?: number
  onClose?: () => void
}

export function NotificationToast({
  message,
  type = "info",
  duration = 5000,
  onClose
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor = {
    info: "bg-white dark:bg-[#181B23] border-indigo-200 dark:border-indigo-500/30",
    success: "bg-green-50 dark:bg-[#181B23] border-green-200 dark:border-green-500/30",
    warning: "bg-yellow-50 dark:bg-[#181B23] border-yellow-200 dark:border-yellow-500/30",
    error: "bg-red-50 dark:bg-[#181B23] border-red-200 dark:border-red-500/30",
  }[type]

  const textColor = {
    info: "text-indigo-700 dark:text-indigo-300",
    success: "text-green-700 dark:text-green-300",
    warning: "text-yellow-700 dark:text-yellow-300",
    error: "text-red-700 dark:text-red-300",
  }[type]

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-lg border shadow-lg ${bgColor} transition-all duration-300`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className={`text-sm ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            if (onClose) onClose()
          }}
          className="text-slate-400 hover:text-slate-600 dark:text-white/30 dark:hover:text-white/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}