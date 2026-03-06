"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

/**
 * PriorityDistributionChart Component
 *
 * Recharts pie chart for priority breakdown
 */

interface PriorityDistributionData {
  name: string
  value: number
  color: string
}

interface PriorityDistributionChartProps {
  data: PriorityDistributionData[]
  className?: string
}

const COLORS = ['#22c55e', '#fbbf24', '#f97316', '#ef4444'] // green, amber, orange, red

export function PriorityDistributionChart({ data, className = "" }: PriorityDistributionChartProps) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "#111318", boxShadow: "0 0 0 1px rgba(255,255,255,0.07)" }}>
      <h3 className="text-base font-semibold text-white/85 mb-4">Priority Distribution</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} tasks`, "Count"]}
              contentStyle={{ background: "#181B23", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "12px", color: "rgba(255,255,255,0.85)" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}