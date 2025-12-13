import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, FileText, Hash, Gauge } from "lucide-react"
import type { Execution } from "@/lib/types"

interface LatestExecutionProps {
  execution: Execution | null
}

export function LatestExecution({ execution }: LatestExecutionProps) {
  if (!execution) {
    return (
      <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Latest Execution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">No executions found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusStyles: Record<string, string> = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    running: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  }

  // Circular progress component
  const CircularProgress = ({ value, size = 120 }: { value: number; size?: number }) => {
    const radius = (size - 8) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (value / 100) * circumference

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="text-purple-600 dark:text-purple-400 transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">/ 100</span>
        </div>
      </div>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Latest Execution</CardTitle>
          <Badge className={statusStyles[execution.status] || statusStyles.success}>
            {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 text-sm">
          <div className="flex items-center gap-3">
            <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Execution ID:</span>
            <span className="font-mono font-medium text-gray-900 dark:text-white">{execution.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Started:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {new Date(execution.start_time).toLocaleString()}
            </span>
            <span className="text-gray-400">•</span>
            <span className="font-medium text-gray-900 dark:text-white">Duration: {execution.duration}</span>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Dataset:</span>
            <span className="font-medium text-gray-900 dark:text-white">{execution.dataset_name}</span>
          </div>
          <div className="flex items-center gap-3 pl-7">
            <span className="text-gray-600 dark:text-gray-400">Rows:</span>
            <span className="font-medium text-gray-900 dark:text-white">{execution.dataset_rows?.toLocaleString()} rows</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">Impact Score</h4>
            <CircularProgress value={execution.impact_score} />
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{execution.confidence}%</div>
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${execution.confidence}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Created: {new Date(execution.created_at).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
