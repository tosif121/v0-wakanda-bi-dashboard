import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History, ArrowUpDown, ExternalLink } from "lucide-react"
import type { Execution } from "@/lib/types"

interface ExecutionHistoryProps {
  executions: Execution[]
}

const statusStyles: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  running: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
}

export function ExecutionHistory({ executions }: ExecutionHistoryProps) {

  const ProgressBar = ({ value }: { value: number }) => {
    const getColor = (score: number) => {
      if (score >= 80) return "bg-emerald-500"
      if (score >= 60) return "bg-amber-500"
      return "bg-red-500"
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getColor(value)}`}
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-900 dark:text-white w-8">{value}</span>
      </div>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
              <History className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Executions</CardTitle>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            View All
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">No executions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-gray-200 dark:border-gray-700">
                  <TableHead className="text-gray-600 dark:text-gray-400 font-medium">
                    <button className="flex items-center gap-1 text-xs">
                      ID
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-400 font-medium">Status</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-400 font-medium">Dataset</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-400 font-medium">
                    <button className="flex items-center gap-1 text-xs">
                      Impact
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-400 font-medium">Duration</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-400 font-medium text-right">
                    <button className="flex items-center justify-end gap-1 text-xs">
                      Time
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executions.map((exec, index) => (
                  <TableRow 
                    key={exec.id || index} 
                    className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50 border-gray-200 dark:border-gray-700"
                  >
                    <TableCell className="font-mono text-xs text-gray-900 dark:text-white">
                      {exec.id}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyles[exec.status] || statusStyles.success}>
                        {exec.status.charAt(0).toUpperCase() + exec.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 dark:text-gray-300">
                      {exec.dataset_name}
                    </TableCell>
                    <TableCell>
                      <ProgressBar value={exec.impact_score} />
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {exec.duration}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-600 dark:text-gray-400">
                      {new Date(exec.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
