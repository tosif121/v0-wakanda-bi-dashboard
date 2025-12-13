'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Target } from "lucide-react"

interface ImpactDistributionProps {
  data?: Array<{
    range: string
    count: number
    percentage: number
  }>
}

export function ImpactDistribution({ data }: ImpactDistributionProps) {
  // Mock data for demo
  const mockData = [
    { range: '90-100', count: 45, percentage: 35, color: '#10b981' },
    { range: '80-89', count: 38, percentage: 30, color: '#3b82f6' },
    { range: '70-79', count: 28, percentage: 22, color: '#f59e0b' },
    { range: '60-69', count: 12, percentage: 9, color: '#ef4444' },
    { range: '<60', count: 5, percentage: 4, color: '#6b7280' },
  ]

  const chartData = data || mockData

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280']

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Impact Score Distribution
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Performance breakdown by score range
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(15 23 42)',
                    border: '1px solid rgb(51 65 85)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="range" 
                  className="text-gray-600 dark:text-gray-400"
                  fontSize={12}
                />
                <YAxis className="text-gray-600 dark:text-gray-400" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(15 23 42)',
                    border: '1px solid rgb(51 65 85)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {chartData.map((item, index) => (
            <div key={item.range} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index] }}
              />
              <div className="text-xs">
                <div className="font-medium text-gray-900 dark:text-white">{item.range}</div>
                <div className="text-gray-600 dark:text-gray-400">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}