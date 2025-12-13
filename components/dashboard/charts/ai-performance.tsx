'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Brain, Zap } from "lucide-react"

interface AIPerformanceProps {
  data?: {
    radar: Array<{
      metric: string
      score: number
      fullMark: number
    }>
    timeline: Array<{
      time: string
      confidence: number
      accuracy: number
      speed: number
    }>
  }
}

export function AIPerformance({ data }: AIPerformanceProps) {
  // Mock data for demo
  const mockRadarData = [
    { metric: 'Accuracy', score: 94, fullMark: 100 },
    { metric: 'Speed', score: 87, fullMark: 100 },
    { metric: 'Confidence', score: 92, fullMark: 100 },
    { metric: 'Consistency', score: 89, fullMark: 100 },
    { metric: 'Insight Quality', score: 96, fullMark: 100 },
    { metric: 'Decision Impact', score: 88, fullMark: 100 },
  ]

  const mockTimelineData = [
    { time: '09:00', confidence: 92, accuracy: 94, speed: 87 },
    { time: '10:00', confidence: 94, accuracy: 96, speed: 89 },
    { time: '11:00', confidence: 91, accuracy: 93, speed: 92 },
    { time: '12:00', confidence: 96, accuracy: 97, speed: 85 },
    { time: '13:00', confidence: 93, accuracy: 95, speed: 88 },
  ]

  const radarData = data?.radar || mockRadarData
  const timelineData = data?.timeline || mockTimelineData

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* AI Performance Radar */}
      <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Performance Metrics
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Multi-dimensional analysis
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-gray-200 dark:stroke-gray-700" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  className="text-gray-600 dark:text-gray-400"
                  fontSize={12}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  className="text-gray-600 dark:text-gray-400"
                  fontSize={10}
                />
                <Radar
                  name="Performance"
                  dataKey="score"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Performance */}
      <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Real-time Performance
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hourly performance tracking
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="time" 
                  className="text-gray-600 dark:text-gray-400"
                  fontSize={12}
                />
                <YAxis 
                  domain={[80, 100]}
                  className="text-gray-600 dark:text-gray-400" 
                  fontSize={12} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(15 23 42)',
                    border: '1px solid rgb(51 65 85)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="Confidence"
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Accuracy"
                />
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name="Speed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}