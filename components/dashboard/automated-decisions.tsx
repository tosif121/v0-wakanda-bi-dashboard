import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Zap, AlertTriangle } from "lucide-react"
import type { Decision } from "@/lib/types"

interface AutomatedDecisionsProps {
  decision: Decision | null
}

export function AutomatedDecisions({ decision }: AutomatedDecisionsProps) {
  if (!decision) {
    return (
      <Card className="transition-all hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Decisions & Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No automated decisions available</p>
        </CardContent>
      </Card>
    )
  }

  const impactScore = decision.impact_score
  const confidence = decision.confidence
  const threshold = decision.threshold
  const actions = decision.actions || []

  return (
    <Card className="transition-all hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Decisions & Actions</CardTitle>
          </div>
          {decision.urgent && (
            <Badge className="bg-destructive/20 text-destructive hover:bg-destructive/30">
              <AlertTriangle className="mr-1 h-3 w-3" />
              High Urgency
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Impact Score Circle */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90 transform">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${impactScore * 2.51} 251`}
                  className="text-primary transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-xl font-bold">{impactScore}</span>
            </div>
            <span className="text-xs text-muted-foreground">Impact Score</span>
          </div>

          {/* Confidence Circle */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90 transform">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${confidence * 2.51} 251`}
                  className="text-success transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-xl font-bold">{confidence}%</span>
            </div>
            <span className="text-xs text-muted-foreground">Confidence</span>
          </div>

          {/* Threshold Indicator */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="h-24 w-24 -rotate-90 transform">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${threshold * 2.51} 251`}
                  className="text-secondary transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-xl font-bold">{threshold}</span>
            </div>
            <span className="text-xs text-muted-foreground">Threshold</span>
          </div>
        </div>

        {actions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Triggered Actions</h4>
            <ul className="space-y-2">
              {actions.map((action, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  <span className="text-muted-foreground">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
