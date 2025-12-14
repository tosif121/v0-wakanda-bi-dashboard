import { Sparkles, Zap, GitBranch, CheckCircle } from "lucide-react"
import { StatCard } from "@/components/reusable/StatCard"
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
      title: "Total Executions",
      value: displayStats.totalExecutions.toLocaleString(),
      icon: <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      borderColor: "border-l-blue-500",
      description: "Workflow runs completed"
    },
    {
      title: "AI Insights Generated",
      value: displayStats.insightsGenerated.toLocaleString(),
      icon: <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      borderColor: "border-l-purple-500",
      description: "Business intelligence reports"
    },
    {
      title: "Automations Triggered",
      value: displayStats.automationsTriggered.toLocaleString(),
      icon: <GitBranch className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
      borderColor: "border-l-amber-500",
      description: "Automated actions executed"
    },
    {
      title: "Success Rate",
      value: `${displayStats.successRate}%`,
      icon: <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      borderColor: "border-l-emerald-500",
      description: "Successful completions"
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          borderColor={stat.borderColor}
          description={stat.description}
          className="hover:shadow-purple-500/10"
        />
      ))}
    </div>
  )
}
