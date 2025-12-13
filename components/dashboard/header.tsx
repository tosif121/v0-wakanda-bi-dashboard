import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Plus, GitBranch, Download, User, Play } from "lucide-react"
import { triggerWakandaWorkflow } from "@/lib/kestra"
import { useState } from "react"

export function DashboardHeader() {
  const [isTriggering, setIsTriggering] = useState(false)

  const handleTriggerWorkflow = async () => {
    setIsTriggering(true)
    try {
      const execution = await triggerWakandaWorkflow()
      console.log('Workflow triggered:', execution.id)
      // You could show a toast notification here
    } catch (error) {
      console.error('Failed to trigger workflow:', error)
      // You could show an error toast here
    } finally {
      setIsTriggering(false)
    }
  }
  return (
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 p-6 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Enhanced Purple gradient "W" icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 blur-lg opacity-50 animate-pulse"></div>
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-xl hover:scale-110 transition-transform duration-200">
                <span className="text-2xl font-bold text-white drop-shadow-lg">W</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Wakanda BI Engine
                </h1>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Live
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                AI-Powered Business Intelligence Automation Platform
              </p>
            </div>
          </div>
        </div>
      
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <Button 
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              onClick={handleTriggerWorkflow}
              disabled={isTriggering}
            >
              {isTriggering ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isTriggering ? 'Running Analysis...' : 'Run Analysis'}
            </Button>
            <Button variant="secondary" className="gap-2 hover:scale-105 transition-transform duration-200">
              <GitBranch className="h-4 w-4" />
              View Workflow
            </Button>
            <Button variant="outline" className="gap-2 hover:scale-105 transition-transform duration-200">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
          
          <div className="flex items-center gap-3 border-l border-gray-200/50 dark:border-gray-700/50 pl-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="h-9 w-9 px-0 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-110 transition-all duration-200">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="sr-only">User menu</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
