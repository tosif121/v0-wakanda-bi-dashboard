'use client'

import { supabase } from './supabase'
import { useEffect, useState } from 'react'
import type { DashboardData } from './types'

export function useRealtimeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    console.log('Fetching dashboard data...')
    try {
      // Get executions with related data
      const { data: executions, error: execError } = await supabase
        .from('executions')
        .select(`
          *,
          ai_insights(*),
          decisions(*)
        `)
        .order('created_at', { ascending: false })

      console.log('Executions query result:', { executions, execError })

      if (execError) {
        console.error('Executions query error:', execError)
        setLoading(false)
        return
      }

      if (!executions) {
        console.log('No executions found')
        setLoading(false)
        return
      }

      // Calculate stats
      const totalExecutions = executions.length
      const successCount = executions.filter(e => e.status === 'success').length
      const successRate = totalExecutions > 0 ? ((successCount / totalExecutions) * 100).toFixed(1) : '0'
      
      // Count insights
      const { count: insightsCount, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*', { count: 'exact', head: true })

      console.log('Insights count result:', { insightsCount, insightsError })

      const stats = {
        totalExecutions,
        insightsGenerated: insightsCount || 0,
        automationsTriggered: executions.filter(e => e.impact_score >= 75).length,
        successRate
      }

      const dashboardData: DashboardData = {
        stats,
        latestExecution: executions[0] || null,
        executionHistory: executions.slice(0, 5)
      }

      console.log('Dashboard data prepared:', dashboardData)
      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchDashboardData()

    // Set up real-time subscriptions
    const executionsSubscription = supabase
      .channel('executions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'executions' },
        () => {
          console.log('Executions updated, refreshing dashboard...')
          fetchDashboardData()
        }
      )
      .subscribe()

    const insightsSubscription = supabase
      .channel('insights_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'ai_insights' },
        () => {
          console.log('AI insights updated, refreshing dashboard...')
          fetchDashboardData()
        }
      )
      .subscribe()

    const decisionsSubscription = supabase
      .channel('decisions_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'decisions' },
        () => {
          console.log('Decisions updated, refreshing dashboard...')
          fetchDashboardData()
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(executionsSubscription)
      supabase.removeChannel(insightsSubscription)
      supabase.removeChannel(decisionsSubscription)
    }
  }, [])

  return { data, loading, refetch: fetchDashboardData }
}