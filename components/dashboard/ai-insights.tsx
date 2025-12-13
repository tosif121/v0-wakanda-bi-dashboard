import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Lightbulb, ArrowRight } from "lucide-react"
import type { AIInsight } from "@/lib/types"

interface AIInsightsProps {
  insights: AIInsight | null
}

export function AIInsights({ insights }: AIInsightsProps) {
  if (!insights) {
    return (
      <Card className="transition-all hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Latest AI Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No AI insights available</p>
        </CardContent>
      </Card>
    )
  }

  const insightsList = insights.insights || []
  const recommendationsList = insights.recommendations || []

  return (
    <Card className="transition-all hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Latest AI Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{insights.summary}</p>

        {insightsList.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-warning" />
              Key Insights
            </h4>
            <ul className="space-y-2">
              {insightsList.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendationsList.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <ArrowRight className="h-4 w-4 text-secondary" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {recommendationsList.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
