"use client"

/**
 * Providers Component
 *
 * Wraps the application with necessary providers:
 * - ThemeProvider for theme management
 * - QueryClientProvider for TanStack Query
 * - NotificationProvider for push notifications
 */

import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { NotificationProvider } from "@/components/providers/NotificationProvider"
import { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <NotificationProvider />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
