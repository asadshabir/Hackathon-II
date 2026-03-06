"use client"

import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from 'recharts'

/**
 * CompletionTrendChart Component
 *
 * Recharts line chart showing completions over time
 */

interface CompletionTrendData {
  date: string
  completions: number
}

interface CompletionTrendChartProps {
  data: CompletionTrendData[]
  className?: string
}

export function CompletionTrendChart({ data, className = "" }: CompletionTrendChartProps) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "#111318", boxShadow: "0 0 0 1px rgba(255,255,255,0.07)" }}>
      <h3 className="text-base font-semibold text-white/85 mb-4">Completion Trends</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.20)" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.20)" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#181B23",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "12px",
                color: "rgba(255,255,255,0.85)",
              }}
              cursor={{ stroke: "rgba(99,102,241,0.3)" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="completions"
              stroke="#4f46e5"
              strokeWidth={2}
              activeDot={{ r: 8 }}
              name="Tasks Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}