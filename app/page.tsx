import { DashboardHeader } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { LatestExecution } from "@/components/dashboard/latest-execution"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { AutomatedDecisions } from "@/components/dashboard/automated-decisions"
import { ExecutionHistory } from "@/components/dashboard/execution-history"
import { supabase } from "@/lib/supabase"
import type { DashboardData, Execution } from "@/lib/types"

async function getDashboardData(): Promise<DashboardData> {
  const { data: executions } = await supabase.from("executions").select("*").order("created_at", { ascending: false })

  const { data: latestExecutions } = await supabase
    .from("executions")
    .select("*, ai_insights(*), decisions(*)")
    .order("created_at", { ascending: false })
    .limit(1)

  const latestExecution = latestExecutions?.[0] || null

  // Calculate stats
  const totalExecutions = executions?.length || 0
  const successCount = executions?.filter((e) => e.status === "success").length || 0
  const successRate = totalExecutions > 0 ? ((successCount / totalExecutions) * 100).toFixed(1) : "0"

  // Count AI insights
  const { count: insightsCount } = await supabase.from("ai_insights").select("*", { count: "exact", head: true })

  return {
    stats: {
      totalExecutions,
      insightsGenerated: insightsCount || 0,
      automationsTriggered: executions?.filter((e) => e.impact_score >= 75).length || 0,
      successRate,
    },
    latestExecution: latestExecution as Execution | null,
    executionHistory: (executions?.slice(0, 5) || []) as Execution[],
  }
}

export default async function Dashboard() {
  const data = await getDashboardData()

  const latestInsights = data.latestExecution?.ai_insights?.[0] || null
  const latestDecision = data.latestExecution?.decisions?.[0] || null

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <DashboardHeader />
        <StatsCards stats={data.stats} />
        <div className="grid gap-6 lg:grid-cols-2">
          <LatestExecution execution={data.latestExecution} />
          <AIInsights insights={latestInsights} />
        </div>
        <AutomatedDecisions decision={latestDecision} />
        <ExecutionHistory executions={data.executionHistory} />
      </div>
    </div>
  )
}
