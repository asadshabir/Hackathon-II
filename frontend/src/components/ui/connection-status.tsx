"use client"

import { useWebSocket } from "@/hooks/useWebSocket"

/**
 * ConnectionStatus Component
 *
 * Green dot (connected), yellow dot (reconnecting), red dot (disconnected).
 * Place in dashboard header.
 */

interface ConnectionStatusProps {
  userId: string | null
  className?: string
}

export function ConnectionStatus({ userId, className = "" }: ConnectionStatusProps) {
  const { status: wsStatus } = useWebSocket({
    userId,
    onEvent: () => {}, // No need to handle events here
    enabled: !!userId,
  })

  const getStatusColor = () => {
    switch (wsStatus) {
      case "connected":
        return "bg-green-500"
      case "reconnecting":
        return "bg-yellow-500"
      case "disconnected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = () => {
    switch (wsStatus) {
      case "connected":
        return "Connected"
      case "reconnecting":
        return "Reconnecting..."
      case "disconnected":
        return "Disconnected"
      default:
        return "Unknown"
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
      <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline-block">
        {getStatusText()}
      </span>
    </div>
  )
}