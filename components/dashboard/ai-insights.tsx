import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Lightbulb, ArrowRight } from "lucide-react"
import type { AIInsight } from "@/lib/types"

interface AIInsightsProps {
  insights: AIInsight | null
}

export function AIInsights({ insights }: AIInsightsProps) {
  if (!insights) {
    return (
      <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Latest AI Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">No AI insights available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Latest AI Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-gray-50 dark:bg-slate-800/50 p-4">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {insights.summary}
          </p>
        </div>

        {insights.insights && insights.insights.length > 0 && (
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
                <Lightbulb className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              </div>
              Key Insights
            </h4>
            <ul className="space-y-3">
              {insights.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                  <span className="text-gray-600 dark:text-gray-300">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {insights.recommendations && insights.recommendations.length > 0 && (
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                <ArrowRight className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              Recommendations
            </h4>
            <ol className="space-y-3">
              {insights.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-medium text-blue-600 dark:text-blue-400">
                    {index + 1}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">{rec}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
