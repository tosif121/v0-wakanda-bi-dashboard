'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { LatestExecution } from "@/components/dashboard/latest-execution"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { AutomatedDecisions } from "@/components/dashboard/automated-decisions"
import { ExecutionHistory } from "@/components/dashboard/execution-history"
import { ExecutionTrends } from "@/components/dashboard/charts/execution-trends"
import { ImpactDistribution } from "@/components/dashboard/charts/impact-distribution"
import { AIPerformance } from "@/components/dashboard/charts/ai-performance"
import { DebugPanel } from "@/components/debug-panel"
import { FloatingActions } from "@/components/floating-actions"
import { DataSourceSelector } from "@/components/data-source-selector"
import { KestraStatus } from "@/components/kestra-status"
import { WorkflowVisualization } from "@/components/workflow-visualization"
import { useRealtimeDashboard } from "@/lib/realtime"

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Direct data fetching function
  const fetchRealData = async () => {
    console.log('Fetching real data from API...')
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/test-db')
      const result = await response.json()
      console.log('API Response:', result)
      
      if (result.success && result.data.executions.data.length > 0) {
        const executions = result.data.executions.data
        const insights = result.data.insights.data
        const decisions = result.data.decisions.data
        
        // Transform to dashboard format
        const transformedData = {
          stats: {
            totalExecutions: executions.length,
            insightsGenerated: insights.length,
            automationsTriggered: executions.filter(e => e.impact_score >= 75).length,
            successRate: executions.length > 0 ? '100.0' : '0'
          },
          latestExecution: executions[0] ? {
            ...executions[0],
            ai_insights: insights.filter(i => i.execution_id === executions[0].id),
            decisions: decisions.filter(d => d.execution_id === executions[0].id)
          } : null,
          executionHistory: executions.slice(0, 5)
        }
        
        console.log('Transformed dashboard data:', transformedData)
        setDashboardData(transformedData)
      } else {
        console.log('No execution data found')
        setError('No execution data available')
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchRealData()
  }, [])

  if (displayLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-6">
              {/* Enhanced Loading Animation */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-linear-to-r from-purple-500 to-blue-600 blur-lg opacity-50 animate-pulse"></div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-blue-600 mx-auto animate-spin">
                  <span className="text-2xl font-bold text-white">W</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Wakanda BI Engine
                </h2>
                <p className="text-gray-600 dark:text-gray-400 animate-pulse">
                  Initializing AI-Powered Analytics...
                </p>
              </div>
              
              {/* Loading Progress Bars */}
              <div className="space-y-3 w-64 mx-auto">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Loading Components</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-linear-to-r from-purple-500 to-blue-600 h-2 rounded-full animate-pulse" style={{width: '85%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!displayData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
          <DashboardHeader />
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">No data available. Run your Kestra workflow to see results!</p>
              <div className="space-x-4">
                <button 
                  onClick={testFetchData}
                  disabled={testLoading}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  {testLoading ? 'Loading...' : 'Load Real Data'}
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Refresh Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const latestInsights = displayData.latestExecution?.ai_insights?.[0] || null
  const latestDecision = displayData.latestExecution?.decisions?.[0] || null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        <DashboardHeader />
        <StatsCards stats={displayData.stats} />
        <div className="grid gap-6 lg:grid-cols-2" data-upload-section>
          <LatestExecution execution={displayData.latestExecution} />
          <AIInsights insights={latestInsights} />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <DataSourceSelector onDataProcessed={(result) => {
            console.log('Data processed:', result)
            // Optionally refresh dashboard data
          }} />
          <KestraStatus />
          <WorkflowVisualization />
        </div>
        <AutomatedDecisions decision={latestDecision} />
        
        {/* Charts Section */}
        <div className="space-y-6">
          <ExecutionTrends />
          <ImpactDistribution />
          <AIPerformance />
        </div>
        
        <ExecutionHistory executions={displayData.executionHistory} />
      </div>
      <FloatingActions />
      <DebugPanel />
    </div>
  )
}
