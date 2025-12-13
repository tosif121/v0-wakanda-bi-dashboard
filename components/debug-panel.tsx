'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Database, Eye, EyeOff, Play } from 'lucide-react'

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      // Get executions
      const { data: executions, error: execError } = await supabase
        .from('executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      // Get insights
      const { data: insights, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)

      // Get decisions
      const { data: decisions, error: decisionsError } = await supabase
        .from('decisions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)

      setData({
        executions: { data: executions, error: execError },
        insights: { data: insights, error: insightsError },
        decisions: { data: decisions, error: decisionsError },
        timestamp: new Date().toLocaleTimeString()
      })
    } catch (error) {
      console.error('Debug fetch error:', error)
      setData({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isVisible) {
      fetchDebugData()
    }
  }, [isVisible])

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="gap-2 bg-white dark:bg-slate-900 shadow-lg"
        >
          <Database className="h-4 w-4" />
          Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto">
      <Card className="bg-white dark:bg-slate-900 shadow-xl border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Debug Panel</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={fetchDebugData}
                variant="ghost"
                size="sm"
                disabled={loading}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/test-db')
                    const result = await response.json()
                    console.log('DB Test Result:', result)
                    alert('Check console for DB test results')
                  } catch (error) {
                    console.error('DB Test Error:', error)
                    alert('DB test failed - check console')
                  }
                }}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                title="Test Database"
              >
                <Database className="h-3 w-3" />
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/kestra/health')
                    const result = await response.json()
                    console.log('Kestra Health:', result)
                    alert(`Kestra Status: ${result.kestra.healthy ? 'Healthy' : 'Unhealthy'} - Check console for details`)
                  } catch (error) {
                    console.error('Kestra Health Error:', error)
                    alert('Kestra health check failed - check console')
                  }
                }}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                title="Test Kestra"
              >
                <Play className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-3">
          {data && (
            <>
              <div className="text-gray-500">Last updated: {data.timestamp}</div>
              
              <div>
                <div className="font-medium text-blue-600">Executions ({data.executions?.data?.length || 0})</div>
                {data.executions?.error && (
                  <div className="text-red-500">Error: {data.executions.error.message}</div>
                )}
                {data.executions?.data?.map((exec: any, i: number) => (
                  <div key={i} className="ml-2 text-gray-600">
                    {exec.id}: {exec.status} ({exec.impact_score}/100)
                  </div>
                ))}
              </div>

              <div>
                <div className="font-medium text-purple-600">AI Insights ({data.insights?.data?.length || 0})</div>
                {data.insights?.error && (
                  <div className="text-red-500">Error: {data.insights.error.message}</div>
                )}
                {data.insights?.data?.map((insight: any, i: number) => (
                  <div key={i} className="ml-2 text-gray-600">
                    {insight.execution_id}: {insight.summary?.substring(0, 50)}...
                  </div>
                ))}
              </div>

              <div>
                <div className="font-medium text-green-600">Decisions ({data.decisions?.data?.length || 0})</div>
                {data.decisions?.error && (
                  <div className="text-red-500">Error: {data.decisions.error.message}</div>
                )}
                {data.decisions?.data?.map((decision: any, i: number) => (
                  <div key={i} className="ml-2 text-gray-600">
                    {decision.execution_id}: {decision.impact_score}/100 ({decision.confidence}%)
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}