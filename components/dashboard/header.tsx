import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, GitBranch, Download, Sparkles } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Wakanda BI Engine</h1>
              <Badge variant="outline" className="border-primary/50 text-primary">
                Kestra
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">AI-Powered Business Intelligence Automation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
          </span>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Execution
        </Button>
        <Button variant="secondary" className="gap-2">
          <GitBranch className="h-4 w-4" />
          View Workflow
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>
    </header>
  )
}
