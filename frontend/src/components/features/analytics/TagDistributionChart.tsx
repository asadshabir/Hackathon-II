"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * TagDistributionChart Component
 *
 * Recharts bar chart for tag usage
 */

interface TagDistributionData {
  name: string
  count: number
}

interface TagDistributionChartProps {
  data: TagDistributionData[]
  className?: string
}

export function TagDistributionChart({ data, className = "" }: TagDistributionChartProps) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "#111318", boxShadow: "0 0 0 1px rgba(255,255,255,0.07)" }}>
      <h3 className="text-base font-semibold text-white/85 mb-4">Tag Distribution</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.20)" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.20)" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#181B23", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "12px", color: "rgba(255,255,255,0.85)" }} />
            <Legend />
            <Bar
              dataKey="count"
              name="Task Count"
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}