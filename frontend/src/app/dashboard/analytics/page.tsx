"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { StatCards } from "@/components/features/analytics/StatCards"
import { CompletionTrendChart } from "@/components/features/analytics/CompletionTrendChart"
import { PriorityDistributionChart } from "@/components/features/analytics/PriorityDistributionChart"
import { TagDistributionChart } from "@/components/features/analytics/TagDistributionChart"
import { useWebSocket, type WebSocketEvent } from "@/hooks/useWebSocket"
import { useAuth } from "@/hooks/useAuth"
import { apiClient } from "@/lib/api"

/**
 * Analytics Dashboard Page
 *
 * Compose StatCards + all 3 charts, fetch from GET /analytics, responsive layout, real-time updates via WebSocket (projection.updated events)
 */

interface AnalyticsData {
  completion_today: number
  completion_week: number
  completion_month: number
  streak: {
    current: number
    longest: number
  }
  priority_distribution: Record<string, number>
  tag_distribution: Record<string, number>
  overdue_count: number
  trends: Array<{
    date: string
    completions: number
  }>
  last_updated: string
}

export default function AnalyticsDashboard() {
  const { session } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load analytics data from API
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setError(null); // Reset error state
        const data = await apiClient.getAnalytics()
        setAnalytics(data)
      } catch (err) {
        console.error("Failed to load analytics:", err)
        setError(err instanceof Error ? err.message : "Failed to load analytics data")
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      loadAnalytics()
    }
  }, [session])

  // WebSocket real-time sync for analytics updates
  const handleWebSocketEvent = (event: WebSocketEvent) => {
    if (event.type === "analytics.updated" && event.data) {
      // Update analytics with new data
      setAnalytics(event.data as unknown as AnalyticsData)
    }
  }

  useWebSocket({
    userId: session?.user?.id ?? null,
    onEvent: handleWebSocketEvent,
    enabled: !!session?.user?.id,
  })

  if (error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Error loading analytics: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">No analytics data available. Complete some tasks to see insights!</p>
        </div>
      </div>
    )
  }

  // Prepare data for charts
  const priorityChartData = Object.entries(analytics.priority_distribution).map(([name, value]) => ({
    name,
    value,
    color: name === "low" ? "#22c55e" : name === "medium" ? "#fbbf24" : name === "high" ? "#f97316" : "#ef4444"
  }))

  const tagChartData = Object.entries(analytics.tag_distribution).map(([name, count]) => ({
    name,
    count
  }))

  return (
    <div className="relative min-h-screen p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Analytics Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Track your productivity and task patterns</p>
        </div>

        {/* Stat Cards */}
        <div>
          <GlassCard className="p-6 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 neumorphic">
            <StatCards stats={analytics} />
          </GlassCard>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl neumorphic">
            <CompletionTrendChart data={analytics.trends} />
          </div>
          <div className="bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl neumorphic">
            <PriorityDistributionChart data={priorityChartData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl neumorphic">
            <TagDistributionChart data={tagChartData} />
          </div>

          {/* Additional Analytics Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-xl p-6 neumorphic">
            <h3 className="text-lg font-semibold mb-4">Additional Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span className="font-medium">Longest Streak:</span>
                <span className="font-bold text-xl">{analytics.streak.longest} days</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/20">
                <span className="font-medium">Completion Rate:</span>
                <span className="font-bold text-xl">
                  {analytics.completion_month > 0
                    ? Math.round((analytics.completion_month - analytics.overdue_count) / analytics.completion_month * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Last Updated:</span>
                <span className="font-medium">
                  {new Date(analytics.last_updated).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}