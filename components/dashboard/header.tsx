import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { GitBranch, Download, User, Play, RefreshCw } from "lucide-react"

import { triggerWakandaWorkflow } from "@/lib/kestra"
import { useState } from "react"

interface DashboardHeaderProps {
  onRefresh?: () => void
}

export function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  const [isTriggering, setIsTriggering] = useState(false)

  const handleTriggerWorkflow = async () => {
    setIsTriggering(true)
    try {
      await triggerWakandaWorkflow()
      // You could show a toast notification here
    } catch (error) {
      console.error('Failed to trigger workflow:', error)
      // You could show an error toast here
    } finally {
      setIsTriggering(false)
    }
  }
  return (
    <header className="relative overflow-hidden rounded-2xl bg-linear-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 p-6 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Enhanced Purple gradient "W" icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-purple-500 to-blue-600 blur-lg opacity-50 animate-pulse"></div>
              <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-blue-600 shadow-xl hover:scale-110 transition-transform duration-200">
                <span className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">W</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Wakanda BI Engine
                </h1>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 w-fit">
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
      
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button 
                variant="outline"
                size="sm"
                className="gap-2 hover:scale-105 transition-transform duration-200"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden lg:inline">Refresh</span>
              </Button>
            )}
            <Button 
              size="sm"
              className="gap-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              onClick={handleTriggerWorkflow}
              disabled={isTriggering}
            >
              {isTriggering ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="hidden lg:inline">{isTriggering ? 'Running...' : 'Run Analysis'}</span>
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2 hover:scale-105 transition-transform duration-200"
              onClick={() => window.open('http://localhost:8080', '_blank')}
            >
              <GitBranch className="h-4 w-4" />
              <span className="hidden lg:inline">View Workflow</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 hover:scale-105 transition-transform duration-200"
              onClick={() => {
                // Generate and download a simple report
                const reportData = {
                  timestamp: new Date().toISOString(),
                  dashboard: 'Wakanda BI Engine',
                  status: 'Active',
                  message: 'Report generation feature coming soon!'
                }
                const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `wakanda-bi-report-${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
            >
              <Download className="h-4 w-4" />
              <span className="hidden lg:inline">Download Report</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 border-l border-gray-200/50 dark:border-gray-700/50 pl-2 sm:pl-4">
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
