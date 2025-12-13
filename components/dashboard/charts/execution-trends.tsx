'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp } from "lucide-react"

interface ExecutionTrendsProps {
  data?: Array<{
    date: string
    executions: number
    success_rate: number
    avg_impact: number
  }>
}

export function ExecutionTrends({ data }: ExecutionTrendsProps) {
  // Mock data for demo - replace with real data
  const mockData = [
    { date: 'Dec 9', executions: 45, success_rate: 96, avg_impact: 82 },
    { date: 'Dec 10', executions: 52, success_rate: 98, avg_impact: 85 },
    { date: 'Dec 11', executions: 38, success_rate: 94, avg_impact: 79 },
    { date: 'Dec 12', executions: 61, success_rate: 99, avg_impact: 88 },
    { date: 'Dec 13', executions: 47, success_rate: 97, avg_impact: 87 },
  ]

  const chartData = data || mockData

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Execution Trends
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Daily performance metrics
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="executionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="date" 
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
              <Area
                type="monotone"
                dataKey="executions"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#executionsGradient)"
                name="Executions"
              />
              <Area
                type="monotone"
                dataKey="avg_impact"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#impactGradient)"
                name="Avg Impact Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}