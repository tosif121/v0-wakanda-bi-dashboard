import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Database, Hash, Gauge } from "lucide-react"
import type { Execution } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface LatestExecutionProps {
  execution: Execution | null
}

export function LatestExecution({ execution }: LatestExecutionProps) {
  if (!execution) {
    return (
      <Card className="transition-all hover:border-primary/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Latest Execution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No executions found</p>
        </CardContent>
      </Card>
    )
  }

  const statusStyles: Record<string, string> = {
    success: "bg-success/20 text-success hover:bg-success/30",
    running: "bg-secondary/20 text-secondary hover:bg-secondary/30",
    failed: "bg-destructive/20 text-destructive hover:bg-destructive/30",
  }

  const timeAgo = formatDistanceToNow(new Date(execution.start_time), { addSuffix: true })

  return (
    <Card className="transition-all hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Latest Execution</CardTitle>
          <Badge className={statusStyles[execution.status] || statusStyles.success}>
            {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Execution ID:</span>
            <span className="font-mono font-medium">{execution.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Started:</span>
            <span className="font-medium">{timeAgo}</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-medium">Duration: {execution.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Dataset:</span>
            <span className="font-medium">{execution.dataset_name}</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-medium">{execution.dataset_rows?.toLocaleString()} rows</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" />
              <span>Impact Score</span>
            </div>
            <span className="font-bold text-primary">{execution.impact_score}/100</span>
          </div>
          <Progress value={execution.impact_score} className="h-2" />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
          <span className="text-sm text-muted-foreground">Confidence Level</span>
          <span className="text-lg font-bold text-success">{execution.confidence}%</span>
        </div>
      </CardContent>
    </Card>
  )
}
