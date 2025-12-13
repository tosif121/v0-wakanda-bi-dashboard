import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History, ArrowUpDown } from "lucide-react"
import type { Execution } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface ExecutionHistoryProps {
  executions: Execution[]
}

const statusStyles: Record<string, string> = {
  success: "bg-success/20 text-success hover:bg-success/30",
  running: "bg-secondary/20 text-secondary hover:bg-secondary/30",
  failed: "bg-destructive/20 text-destructive hover:bg-destructive/30",
}

export function ExecutionHistory({ executions }: ExecutionHistoryProps) {
  return (
    <Card className="transition-all hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Execution History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No executions found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[140px]">
                  <button className="flex items-center gap-1 text-xs font-medium">
                    Execution ID
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dataset</TableHead>
                <TableHead className="text-center">
                  <button className="flex items-center gap-1 text-xs font-medium">
                    Impact
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">
                  <button className="flex items-center justify-end gap-1 text-xs font-medium">
                    Timestamp
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.map((exec) => (
                <TableRow key={exec.id} className="cursor-pointer transition-colors hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">{exec.id}</TableCell>
                  <TableCell>
                    <Badge className={statusStyles[exec.status] || statusStyles.success}>{exec.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{exec.dataset_name}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`font-medium ${exec.impact_score >= 70 ? "text-success" : exec.impact_score >= 40 ? "text-warning" : "text-destructive"}`}
                    >
                      {exec.impact_score}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{exec.duration}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(exec.created_at), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
