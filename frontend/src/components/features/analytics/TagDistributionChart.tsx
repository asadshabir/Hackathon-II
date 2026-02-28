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
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tag Distribution</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Bar
              dataKey="count"
              name="Task Count"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}