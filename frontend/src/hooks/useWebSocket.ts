"use client"

/**
 * useWebSocket Hook
 *
 * Connects to the backend WebSocket at /ws/{user_id}.
 * Features:
 * - Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s)
 * - Dispatches received events to a callback
 * - Exposes connection status for UI indicators
 * - Graceful cleanup on unmount
 */

import { useCallback, useEffect, useRef, useState } from "react"

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting"

export interface WebSocketEvent {
  type: string
  data?: Record<string, unknown>
  [key: string]: unknown
}

interface UseWebSocketOptions {
  /** User ID to connect with */
  userId: string | null
  /** Base URL for the WebSocket server (defaults to NEXT_PUBLIC_API_URL) */
  baseUrl?: string
  /** Callback fired on every received event */
  onEvent?: (event: WebSocketEvent) => void
  /** Whether the connection should be active */
  enabled?: boolean
}

interface UseWebSocketReturn {
  /** Current connection status */
  status: ConnectionStatus
  /** Send a JSON message to the server */
  sendMessage: (message: Record<string, unknown>) => void
  /** Manually disconnect */
  disconnect: () => void
  /** Manually reconnect */
  reconnect: () => void
}

const INITIAL_BACKOFF_MS = 1000
const MAX_BACKOFF_MS = 30000
const BACKOFF_MULTIPLIER = 2
const PING_INTERVAL_MS = 25000

export function useWebSocket({
  userId,
  baseUrl,
  onEvent,
  enabled = true,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const wsRef = useRef<WebSocket | null>(null)
  const backoffRef = useRef(INITIAL_BACKOFF_MS)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)
  const onEventRef = useRef(onEvent)

  // Keep callback ref up to date without re-triggering effect
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current)
      pingTimerRef.current = null
    }
  }, [])

  const getWsUrl = useCallback(
    (uid: string): string => {
      // Use explicit WebSocket URL if set (for production wss://)
      const wsEnv = process.env.NEXT_PUBLIC_WEBSOCKET_URL
      if (wsEnv) {
        const wsBase = wsEnv.endsWith("/") ? wsEnv.slice(0, -1) : wsEnv
        return `${wsBase}/ws/${uid}`
      }
      // Fall back to deriving from API URL (http→ws, https→wss)
      const base = baseUrl || process.env.NEXT_PUBLIC_API_URL || ""
      const wsBase = base.replace(/^http/, "ws")
      return `${wsBase}/ws/${uid}`
    },
    [baseUrl]
  )

  const connect = useCallback(() => {
    if (!userId || !enabled || !mountedRef.current) return

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    clearTimers()
    setStatus("connecting")

    const url = getWsUrl(userId)
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      setStatus("connected")
      backoffRef.current = INITIAL_BACKOFF_MS

      // Start ping interval to keep connection alive
      pingTimerRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }))
        }
      }, PING_INTERVAL_MS)
    }

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return
      try {
        const parsed = JSON.parse(event.data) as WebSocketEvent
        // Ignore pong responses
        if (parsed.type === "pong") return
        onEventRef.current?.(parsed)
      } catch {
        // Non-JSON messages are silently ignored
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      clearTimers()
      setStatus("reconnecting")

      // Schedule reconnect with exponential backoff
      const delay = backoffRef.current
      backoffRef.current = Math.min(
        backoffRef.current * BACKOFF_MULTIPLIER,
        MAX_BACKOFF_MS
      )

      reconnectTimerRef.current = setTimeout(() => {
        if (mountedRef.current && enabled) {
          connect()
        }
      }, delay)
    }

    ws.onerror = () => {
      // onclose will fire after onerror, so reconnect is handled there
      if (ws.readyState !== WebSocket.CLOSED) {
        ws.close()
      }
    }
  }, [userId, enabled, getWsUrl, clearTimers])

  const disconnect = useCallback(() => {
    clearTimers()
    if (wsRef.current) {
      wsRef.current.onclose = null // Prevent reconnect on intentional disconnect
      wsRef.current.close()
      wsRef.current = null
    }
    setStatus("disconnected")
  }, [clearTimers])

  const reconnect = useCallback(() => {
    disconnect()
    backoffRef.current = INITIAL_BACKOFF_MS
    connect()
  }, [disconnect, connect])

  const sendMessage = useCallback(
    (message: Record<string, unknown>) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message))
      }
    },
    []
  )

  // Connect on mount / when userId changes
  useEffect(() => {
    mountedRef.current = true

    if (userId && enabled) {
      connect()
    }

    return () => {
      mountedRef.current = false
      clearTimers()
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [userId, enabled, connect, clearTimers])

  return { status, sendMessage, disconnect, reconnect }
}
