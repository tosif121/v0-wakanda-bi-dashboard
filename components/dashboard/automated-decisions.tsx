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
      <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">AI Decisions & Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">No automated decisions available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Circular progress component
  const CircularProgress = ({ 
    value, 
    size = 100, 
    color = "text-purple-600 dark:text-purple-400",
    label 
  }: { 
    value: number; 
    size?: number; 
    color?: string;
    label?: string;
  }) => {
    const radius = (size - 8) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (value / 100) * circumference

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={`${color} transition-all duration-500`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">{value}</span>
            {label && <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">AI Decisions & Actions</CardTitle>
          </div>
          {decision.urgent && (
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
              <AlertTriangle className="mr-1 h-3 w-3" />
              HIGH
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="text-center">
            <CircularProgress 
              value={decision.impact_score} 
              color="text-purple-600 dark:text-purple-400"
              label="/ 100"
            />
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Impact Score</p>
          </div>

          <div className="text-center">
            <CircularProgress 
              value={decision.confidence} 
              color="text-emerald-600 dark:text-emerald-400"
              label="%"
            />
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Confidence</p>
          </div>

          <div className="text-center">
            <div className="space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">Threshold</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{decision.threshold}/100</div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${decision.threshold}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {decision.actions && decision.actions.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Triggered Actions</h4>
            <ul className="space-y-3">
              {decision.actions.map((action, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-gray-700 dark:text-gray-300">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(decision.created_at).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
