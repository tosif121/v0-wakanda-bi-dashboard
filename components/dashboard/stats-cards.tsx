import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Sparkles, Zap, GitBranch, CheckCircle } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import type { DashboardStats } from "@/lib/types"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  // Mini chart data for each stat
  const generateMiniChartData = (trend: number) => {
    const baseValue = 50
    return Array.from({ length: 7 }, (_, i) => ({
      value: baseValue + Math.random() * 20 + (trend > 0 ? i * 2 : -i * 2)
    }))
  }

  const statItems = [
    {
      label: "Total Executions",
      value: stats.totalExecutions.toLocaleString(),
      trend: "+12.5%",
      icon: Zap,
      trendUp: true,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      chartColor: "#3b82f6",
      chartData: generateMiniChartData(12.5),
    },
    {
      label: "AI Insights Generated",
      value: stats.insightsGenerated.toLocaleString(),
      trend: "+8.2%",
      icon: Sparkles,
      trendUp: true,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      chartColor: "#8b5cf6",
      chartData: generateMiniChartData(8.2),
    },
    {
      label: "Automations Triggered",
      value: stats.automationsTriggered.toLocaleString(),
      trend: "+15.3%",
      icon: GitBranch,
      trendUp: true,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      chartColor: "#f59e0b",
      chartData: generateMiniChartData(15.3),
    },
    {
      label: "Success Rate",
      value: `${stats.successRate}%`,
      trend: "+2.1%",
      icon: CheckCircle,
      trendUp: true,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      chartColor: "#10b981",
      chartData: generateMiniChartData(2.1),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => (
        <Card
          key={stat.label}
          className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 hover:scale-105"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>

            {/* Mini Chart */}
            <div className="mt-4 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stat.chartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={stat.chartColor}
                    strokeWidth={2}
                    dot={false}
                    strokeOpacity={0.8}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
