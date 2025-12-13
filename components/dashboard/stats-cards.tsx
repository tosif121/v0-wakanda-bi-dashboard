import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Zap, GitBranch, CheckCircle } from "lucide-react"

import type { DashboardStats } from "@/lib/types"

interface StatsCardsProps {
  stats?: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  // Provide default stats if none provided
  const defaultStats = {
    totalExecutions: 0,
    insightsGenerated: 0,
    automationsTriggered: 0,
    successRate: '0'
  }
  
  const displayStats = stats || defaultStats
  const statItems = [
    {
      label: "Total Executions",
      value: displayStats.totalExecutions.toLocaleString(),
      icon: Zap,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "AI Insights Generated",
      value: displayStats.insightsGenerated.toLocaleString(),
      icon: Sparkles,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Automations Triggered",
      value: displayStats.automationsTriggered.toLocaleString(),
      icon: GitBranch,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Success Rate",
      value: `${displayStats.successRate}%`,
      icon: CheckCircle,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
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
            <div className="flex items-center mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
