'use client'

import { useState, useEffect } from 'react'
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
  Activity
} from 'lucide-react'
import { getExecutionStatus, listRecentExecutions, checkKestraHealth, type KestraExecution } from '@/lib/kestra'

interface KestraStatusProps {
  executionId?: string
  onExecutionComplete?: (execution: KestraExecution) => void
}

export function KestraStatus({ executionId, onExecutionComplete }: KestraStatusProps) {
  const [execution, setExecution] = useState<KestraExecution | null>(null)
  const [recentExecutions, setRecentExecutions] = useState<KestraExecution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [healthLoading, setHealthLoading] = useState(false)

  const fetchExecutionStatus = async (id: string) => {
    try {
      const exec = await getExecutionStatus(id)
      setExecution(exec)
      
      if (exec.state.current === 'SUCCESS' || exec.state.current === 'FAILED') {
        onExecutionComplete?.(exec)
      }
    } catch (err) {
      setError('Failed to fetch execution status')
      console.error(err)
    }
  }

  const fetchRecentExecutions = async () => {
    setLoading(true)
    try {
      const executions = await listRecentExecutions(5)
      setRecentExecutions(executions)
      setError('') // Clear error on success
    } catch (err) {
      setError('Failed to fetch recent executions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchHealthStatus = async () => {
    setHealthLoading(true)
    try {
      const health = await checkKestraHealth()
      setHealthStatus(health)
      setError('') // Clear error on success
    } catch (err) {
      setError('Failed to check Kestra health')
      console.error(err)
    } finally {
      setHealthLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentExecutions()
    fetchHealthStatus()
  }, [])

  useEffect(() => {
    if (executionId) {
      fetchExecutionStatus(executionId)
      
      // Poll for updates if execution is running
      const interval = setInterval(() => {
        fetchExecutionStatus(executionId)
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [executionId])

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
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-red-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Kestra Workflow Status
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time execution monitoring
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                fetchRecentExecutions()
                fetchHealthStatus()
              }}
              disabled={loading || healthLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading || healthLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(process.env.NEXT_PUBLIC_KESTRA_URL, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-3 w-3" />
              Kestra UI
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Health Status */}
        {healthStatus && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Connection Status</h4>
            
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {healthStatus.kestra.healthy ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Kestra Server
                  </span>
                </div>
                <Badge className={healthStatus.kestra.healthy 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                }>
                  {healthStatus.kestra.healthy ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                <div>URL: {healthStatus.kestra.url}</div>
                <div>Namespace: {healthStatus.environment.namespace}</div>
                <div>Flow ID: {healthStatus.environment.flowId}</div>
                {!healthStatus.kestra.healthy && healthStatus.kestra.error && (
                  <div className="mt-1 text-red-600 dark:text-red-400">
                    Error: {healthStatus.kestra.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Current Execution */}
        {execution && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Current Execution</h4>
            
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(execution.state.current)}
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">Recent Executions</h4>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            {recentExecutions.length === 0 && !loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent executions found
              </p>
            ) : (
              recentExecutions.map((exec) => (
                <div
                  key={exec.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(exec.state.current)}
                    <div>
                      <p className="font-mono text-xs text-gray-900 dark:text-white">
                        {exec.id.substring(0, 12)}...
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
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
      </CardContent>
    </Card>
  )
}