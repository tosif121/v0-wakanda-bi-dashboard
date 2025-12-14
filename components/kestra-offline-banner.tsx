'use client'

import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKestraConnection } from '@/lib/use-kestra-connection'

export function KestraOfflineBanner() {
  const connection = useKestraConnection()

  // Don't show banner if connected or still checking initially
  if (connection.isConnected || (connection.lastChecked === null && connection.isChecking)) {
    return null
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Kestra Server Offline
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Workflow processing is unavailable. Start the server to enable AI analysis.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={connection.checkConnection}
              disabled={connection.isChecking}
              className="gap-1.5 h-7 px-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            >
              <RefreshCw className={`h-3 w-3 ${connection.isChecking ? 'animate-spin' : ''}`} />
              <span className="text-xs">Retry</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('http://localhost:8080', '_blank')}
              className="gap-1.5 h-7 px-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="text-xs">Open Kestra</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}