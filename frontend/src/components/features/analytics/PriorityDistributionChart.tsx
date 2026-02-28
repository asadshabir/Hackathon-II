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
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Priority Distribution</h3>
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
              formatter={(value) => [`${value} tasks`, 'Count']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}