import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Sparkles, Zap, Target } from "lucide-react"
import type { DashboardStats } from "@/lib/types"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      label: "Total Executions",
      value: stats.totalExecutions.toLocaleString(),
      trend: "+12.5%",
      icon: Zap,
      trendUp: true,
    },
    {
      label: "AI Insights Generated",
      value: stats.insightsGenerated.toLocaleString(),
      trend: "+8.2%",
      icon: Sparkles,
      trendUp: true,
    },
    {
      label: "Automations Triggered",
      value: stats.automationsTriggered.toLocaleString(),
      trend: "+15.3%",
      icon: Target,
      trendUp: true,
    },
    {
      label: "Success Rate",
      value: `${stats.successRate}%`,
      trend: "+2.1%",
      icon: TrendingUp,
      trendUp: true,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => (
        <Card
          key={stat.label}
          className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? "text-success" : "text-destructive"}`}
              >
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
