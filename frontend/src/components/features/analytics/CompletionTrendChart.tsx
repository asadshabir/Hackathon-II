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
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Completion Trends</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
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