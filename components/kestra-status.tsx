'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Loader2,
  Activity,
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react'
import { getExecutionStatus, listRecentExecutions, type KestraExecution } from '@/lib/kestra'
import { useKestraConnectionContext } from '@/lib/kestra-connection-context'

interface KestraStatusProps {
  executionId?: string
  onExecutionComplete?: (execution: KestraExecution) => void
}

export function KestraStatus({ executionId, onExecutionComplete }: KestraStatusProps) {
  const [execution, setExecution] = useState<KestraExecution | null>(null)
  const [recentExecutions, setRecentExecutions] = useState<KestraExecution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const connection = useKestraConnectionContext()

  const fetchExecutionStatus = async (id: string) => {
    try {
      const exec = await getExecutionStatus(id)
      setExecution(exec)
      
      if (exec.state.current === 'SUCCESS' || exec.state.current === 'FAILED') {
        onExecutionComplete?.(exec)
      }
    } catch (err) {
      setError('Failed to fetch execution status')
    }
  }

  // Rate limiting for executions fetch
  const lastExecutionsFetchRef = useRef(0)
  const EXECUTIONS_FETCH_COOLDOWN = 3000 // 3 seconds minimum between fetches

  const fetchRecentExecutions = async () => {
    // Only fetch if connected
    if (!connection.canMakeApiCalls) {
      console.log('Skipping executions fetch - Kestra server not connected')
      return
    }

    // Rate limiting
    const now = Date.now()
    if (now - lastExecutionsFetchRef.current < EXECUTIONS_FETCH_COOLDOWN) {
      console.log('Executions fetch rate limited in component')
      return
    }
    lastExecutionsFetchRef.current = now
    
    setLoading(true)
    try {
      const executions = await listRecentExecutions()
      setRecentExecutions(executions)
      setError('') // Clear error on success
    } catch (err) {
      console.warn('Failed to fetch recent executions:', err)
      setRecentExecutions([]) // Set empty array instead of error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch executions when connected
    if (connection.isConnected) {
      fetchRecentExecutions()
    }
  }, [connection.isConnected])

  useEffect(() => {
    if (executionId && connection.canMakeApiCalls) {
      fetchExecutionStatus(executionId)
      
      // Poll for updates if execution is running and connected (less aggressive)
      const interval = setInterval(() => {
        if (connection.canMakeApiCalls) {
          fetchExecutionStatus(executionId)
        }
      }, 5000) // Increased to 5 seconds

      return () => clearInterval(interval)
    }
  }, [executionId, connection.canMakeApiCalls])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-500" />
      case 'RUNNING': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'CREATED': return <Clock className="h-4 w-4 text-gray-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      case 'FAILED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'RUNNING': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    }
  }

  const calculateProgress = (execution: KestraExecution) => {
    if (!execution.state.histories) return 0
    
    const totalSteps = 7 // Based on your workflow steps
    const completedSteps = execution.state.histories.length
    
    if (execution.state.current === 'SUCCESS') return 100
    if (execution.state.current === 'FAILED') return Math.min((completedSteps / totalSteps) * 100, 90)
    
    return Math.min((completedSteps / totalSteps) * 100, 95)
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-orange-500 to-red-600">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Kestra Status
              </CardTitle>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Workflow monitoring
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                connection.checkConnection()
                if (connection.canMakeApiCalls) {
                  fetchRecentExecutions()
                }
              }}
              disabled={loading || connection.isChecking}
              className="gap-1.5 h-7 px-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading || connection.isChecking ? 'animate-spin' : ''}`} />
              <span className="text-xs">Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('http://localhost:8080', '_blank')}
              className="gap-1.5 h-7 px-2"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="text-xs">Open</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex flex-col h-full">
        {/* Connection Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Connection Status</h4>
          
          <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {connection.isChecking ? (
                  <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                ) : connection.isConnected ? (
                  <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  Kestra Server
                </span>
              </div>
              <Badge className={`text-xs ${connection.isConnected 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
              }`}>
                {connection.isChecking ? 'Checking...' : connection.isConnected ? 'Connected' : 'Offline'}
              </Badge>
            </div>
            
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
              <div>Namespace: {process.env.NEXT_PUBLIC_KESTRA_NAMESPACE || 'assemblehack25.wakanda'}</div>
              <div>Flow: {process.env.NEXT_PUBLIC_KESTRA_FLOW_ID || 'wakanda_business_intelligence_engine'}</div>
              {connection.lastChecked && (
                <div>Last checked: {connection.lastChecked.toLocaleTimeString()}</div>
              )}
              {connection.error && (
                <div className="mt-1 text-red-600 dark:text-red-400">
                  Error: {connection.error}
                </div>
              )}
              {!connection.isConnected && connection.retryCount > 0 && (
                <div className="mt-1 text-amber-600 dark:text-amber-400">
                  Retrying... (attempt {connection.retryCount}/4)
                </div>
              )}
            </div>
          </div>
          
          {/* Offline Notice */}
          {connection.shouldShowOfflineMessage && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Kestra server is offline. Make sure it's running and accessible
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Current Execution */}
        {execution && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Current Execution</h4>
            
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(execution.state.current)}
                  <span className="text-sm text-gray-900 dark:text-white">
                    {execution.id}
                  </span>
                </div>
                <Badge className={getStatusColor(execution.state.current)}>
                  {execution.state.current}
                </Badge>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Progress</span>
                  <span>{Math.round(calculateProgress(execution))}%</span>
                </div>
                <Progress value={calculateProgress(execution)} className="h-2" />
              </div>
              
              {/* Execution Timeline */}
              {execution.state.histories && execution.state.histories.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">Timeline</h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {execution.state.histories.slice(-5).map((history, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {getStatusIcon(history.state)}
                        <span className="text-gray-600 dark:text-gray-400">
                          {history.state}
                        </span>
                        <span className="text-gray-500 dark:text-gray-500 ml-auto">
                          {new Date(history.date).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Executions */}
        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">Recent Executions</h4>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
          </div>
          
          {error && connection.isConnected && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          
          {/* Fixed height container with overflow */}
          <div className="h-64 overflow-y-auto">
            <div className="space-y-2 pr-2">
              {!connection.isConnected ? (
                <div className="text-center py-6">
                  <WifiOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Server offline - executions unavailable
                  </p>
                </div>
              ) : recentExecutions.length === 0 && !loading ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent executions found
                  </p>
                </div>
              ) : (
                recentExecutions.map((exec) => (
                  <div
                    key={exec.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {getStatusIcon(exec.state.current)}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-900 dark:text-white truncate">
                          {exec.id.substring(0, 12)}...
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {exec.startDate ? new Date(exec.startDate).toLocaleString() : 'Unknown time'}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(exec.state.current)} variant="outline">
                      {exec.state.current}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}