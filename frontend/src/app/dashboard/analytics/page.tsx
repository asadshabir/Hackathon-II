"use client"

import { useState, useEffect } from "react"
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-white/50 text-sm">Error loading analytics: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: "#6366F1", borderRightColor: "rgba(99,102,241,0.25)" }} />
          <p className="text-white/40 text-sm">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-white/40 text-sm">No data yet — complete some tasks to see insights!</p>
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
    <div className="min-h-screen pt-5 pb-2 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="px-1">
          <p className="text-[10px] font-bold text-white/28 uppercase tracking-widest mb-0.5">Analytics</p>
          <h1 className="text-xl font-black text-white">
            <span style={{
              background: "linear-gradient(135deg, #FBBF24 0%, #F97316 50%, #EF4444 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Productivity Insights</span>
          </h1>
          <p className="text-xs text-white/40 mt-0.5">Track your task patterns and streaks</p>
        </div>

        {/* Stat Cards */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(17,19,24,1) 100%)",
            boxShadow: "0 0 0 1px rgba(251,191,36,0.18)",
          }}
        >
          <StatCards stats={analytics} />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(17,19,24,1) 100%)", boxShadow: "0 0 0 1px rgba(99,102,241,0.15)" }}>
            <CompletionTrendChart data={analytics.trends} />
          </div>
          <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(17,19,24,1) 100%)", boxShadow: "0 0 0 1px rgba(249,115,22,0.15)" }}>
            <PriorityDistributionChart data={priorityChartData} />
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(17,19,24,1) 100%)", boxShadow: "0 0 0 1px rgba(52,211,153,0.15)" }}>
            <TagDistributionChart data={tagChartData} />
          </div>

          {/* Insights card */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(56,189,248,0.06) 100%)",
              boxShadow: "0 0 0 1px rgba(99,102,241,0.18)",
            }}
          >
            <h3 className="text-sm font-semibold text-white/80 mb-4">Additional Insights</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                <span className="text-sm text-white/50">Longest Streak</span>
                <span className="font-bold text-white glow-text-violet">{analytics.streak.longest} days</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/[0.06]">
                <span className="text-sm text-white/50">Completion Rate</span>
                <span className="font-bold text-white glow-text-cyan">
                  {analytics.completion_month > 0
                    ? Math.round((analytics.completion_month - analytics.overdue_count) / analytics.completion_month * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-white/50">Last Updated</span>
                <span className="text-xs text-white/40">
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