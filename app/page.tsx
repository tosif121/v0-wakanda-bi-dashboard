'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { DashboardHeader } from '@/components/dashboard/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { LatestExecution } from '@/components/dashboard/latest-execution';
import { AIInsights } from '@/components/dashboard/ai-insights';
import { AutomatedDecisions } from '@/components/dashboard/automated-decisions';
import { ExecutionHistory } from '@/components/dashboard/execution-history';
import { ExecutionTrends } from '@/components/dashboard/charts/execution-trends';
import { ImpactDistribution } from '@/components/dashboard/charts/impact-distribution';
import { AIPerformance } from '@/components/dashboard/charts/ai-performance';

import { DataSourceSelector } from '@/components/data-source-selector';
import { KestraStatus } from '@/components/kestra-status';
import { WorkflowVisualization } from '@/components/workflow-visualization';
import { DashboardSkeleton } from '@/components/dashboard/skeleton-loader';
import { KestraOfflineBanner } from '@/components/kestra-offline-banner';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const activeIntervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Helper function to safely calculate percentages
  const safePercentage = (count: number, total: number): number => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  // Direct data fetching function
  const fetchRealData = useCallback(async (isInitialLoad = false, showToast = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else if (showToast) {
      toast.loading('Updating dashboard...', { id: 'dashboard-refresh' });
    }

    try {
      // Fetch data from both Supabase and Kestra
      const [supabaseData, kestraData] = await Promise.allSettled([
        // Supabase data
        Promise.all([
          supabase.from('executions').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('ai_insights').select('*').order('created_at', { ascending: false }).limit(3),
          supabase.from('decisions').select('*').order('created_at', { ascending: false }).limit(3),
        ]),
        // Latest Kestra execution
        fetch('/api/kestra/executions?limit=1').then((res) => (res.ok ? res.json() : null)),
      ]);

      let executions = [];
      let insights = [];
      let decisions = [];
      let latestKestraExecution = null;

      // Process Supabase data
      if (supabaseData.status === 'fulfilled') {
        const [executionsResult, insightsResult, decisionsResult] = supabaseData.value;
        executions = executionsResult.data || [];
        insights = insightsResult.data || [];
        decisions = decisionsResult.data || [];
      }

      // Process Kestra data
      if (kestraData.status === 'fulfilled' && kestraData.value?.results?.[0]) {
        latestKestraExecution = kestraData.value.results[0];
      }

      // Check if we have a newly completed execution
      const previousLatestExecution = dashboardData?.latestExecution;
      const currentLatestExecution = latestKestraExecution || executions[0];

      // Show completion toast if execution just finished
      if (
        currentLatestExecution &&
        currentLatestExecution.state?.current === 'SUCCESS' &&
        previousLatestExecution?.id !== currentLatestExecution.id &&
        !isInitialLoad
      ) {
        toast.success('🎉 Workflow completed successfully!', {
          duration: 5000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        });
      }

      // Transform to dashboard format
      const transformedData = {
        stats: {
          totalExecutions: executions.length,
          insightsGenerated: insights.length,
          automationsTriggered: executions.filter((e: any) => e.impact_score >= 75).length,
          successRate: executions.length > 0 ? '100.0' : '0',
        },
        latestExecution: executions[0]
          ? {
              ...executions[0],
              // Add Kestra execution data if available
              ...(latestKestraExecution && {
                kestra_execution: latestKestraExecution,
                state: latestKestraExecution.state,
              }),
              ai_insights: insights.filter((i: any) => i.execution_id === executions[0].id),
              decisions: decisions.filter((d: any) => d.execution_id === executions[0].id),
            }
          : latestKestraExecution, // Use Kestra execution if no Supabase data
        executionHistory: executions.slice(0, 5),
      };

      setDashboardData(transformedData);

      // Show success toast if this was a manual refresh
      if (showToast && !isInitialLoad) {
        toast.success('Dashboard updated!', { id: 'dashboard-refresh' });
      }
    } catch (err) {
      // Handle error silently in production
      if (showToast && !isInitialLoad) {
        toast.error('Failed to update dashboard', { id: 'dashboard-refresh' });
      }
    } finally {
      setLoading(false);
    }
  }, [dashboardData]);

  // Fetch data on component mount and when URL has refresh param
  useEffect(() => {
    fetchRealData(true);

    // Check if we should refresh (from upload redirect)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') === 'true') {
      // Remove the refresh param from URL
      window.history.replaceState({}, '', window.location.pathname);
      // Refresh data every 2 seconds for 30 seconds to catch new data
      let refreshCount = 0;
      const refreshInterval = setInterval(() => {
        refreshCount++;
        fetchRealData(false);
        if (refreshCount >= 15) {
          clearInterval(refreshInterval);
        }
      }, 2000);

      return () => clearInterval(refreshInterval);
    }
  }, [fetchRealData]);

  // Cleanup all active intervals on unmount
  useEffect(() => {
    return () => {
      activeIntervalsRef.current.forEach(interval => clearInterval(interval));
      activeIntervalsRef.current.clear();
    };
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Always show dashboard, even with no data

  const latestInsights = dashboardData?.latestExecution?.ai_insights?.[0] || null;
  const latestDecision = dashboardData?.latestExecution?.decisions?.[0] || null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Kestra Offline Banner */}
      <KestraOfflineBanner />
      
      <div className="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <DashboardHeader onRefresh={() => fetchRealData(false, true)} dashboardData={dashboardData} />

        {/* Key Metrics */}
        <StatsCards stats={dashboardData?.stats} />

        {/* Data Input & Workflow Control */}
        <div className="grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DataSourceSelector
            onDataProcessed={(execution) => {
              // Show workflow triggered toast
              toast.success(`Workflow triggered! ID: ${execution.id?.slice(0, 8)}...`, {
                duration: 4000,
                icon: '🚀',
              });

              // Immediately refresh dashboard data when new execution is triggered
              fetchRealData(false, false);

              // Set up periodic refresh to catch workflow progress
              let refreshCount = 0;
              toast.loading('Monitoring workflow progress...', {
                duration: Infinity,
                id: 'workflow-monitor',
              });

              const refreshInterval = setInterval(() => {
                refreshCount++;
                fetchRealData(false, false);

                // Update monitoring toast with progress
                toast.loading(`Monitoring workflow... (${refreshCount * 2}s)`, {
                  id: 'workflow-monitor',
                });

                // Stop refreshing after 30 seconds (15 intervals * 2 seconds)
                if (refreshCount >= 15) {
                  clearInterval(refreshInterval);
                  activeIntervalsRef.current.delete(refreshInterval);
                  toast.dismiss('workflow-monitor');
                  toast('Workflow monitoring complete', {
                    icon: '⏱️',
                    duration: 3000,
                  });
                }
              }, 2000);

              // Track the interval for cleanup
              activeIntervalsRef.current.add(refreshInterval);
            }}
          />
          <KestraStatus />
          <WorkflowVisualization latestExecution={dashboardData?.latestExecution} />
        </div>

        {/* Latest Results */}
        <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
          <LatestExecution execution={dashboardData?.latestExecution} />
          <AIInsights insights={latestInsights} />
        </div>

        {/* Automated Decisions */}
        <AutomatedDecisions decision={latestDecision} />

        {/* Analytics Charts */}
        <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
          <ExecutionTrends
            data={
              dashboardData?.executionHistory
                ? dashboardData.executionHistory.map((exec: any, index: number) => ({
                    date: new Date(exec.created_at || Date.now() - index * 24 * 60 * 60 * 1000).toLocaleDateString(),
                    executions: 1,
                    success_rate: exec.impact_score || 0,
                    avg_impact: exec.impact_score || 0,
                  }))
                : undefined
            }
          />
          <ImpactDistribution
            data={
              dashboardData?.executionHistory && dashboardData.executionHistory.length > 0
                ? [
                    {
                      range: '90-100',
                      count: dashboardData.executionHistory.filter((e: any) => e.impact_score >= 90).length,
                      percentage: safePercentage(
                        dashboardData.executionHistory.filter((e: any) => e.impact_score >= 90).length,
                        dashboardData.executionHistory.length
                      ),
                    },
                    {
                      range: '80-89',
                      count: dashboardData.executionHistory.filter(
                        (e: any) => e.impact_score >= 80 && e.impact_score < 90
                      ).length,
                      percentage: safePercentage(
                        dashboardData.executionHistory.filter((e: any) => e.impact_score >= 80 && e.impact_score < 90).length,
                        dashboardData.executionHistory.length
                      ),
                    },
                    {
                      range: '70-79',
                      count: dashboardData.executionHistory.filter(
                        (e: any) => e.impact_score >= 70 && e.impact_score < 80
                      ).length,
                      percentage: safePercentage(
                        dashboardData.executionHistory.filter((e: any) => e.impact_score >= 70 && e.impact_score < 80).length,
                        dashboardData.executionHistory.length
                      ),
                    },
                    {
                      range: '60-69',
                      count: dashboardData.executionHistory.filter(
                        (e: any) => e.impact_score >= 60 && e.impact_score < 70
                      ).length,
                      percentage: safePercentage(
                        dashboardData.executionHistory.filter((e: any) => e.impact_score >= 60 && e.impact_score < 70).length,
                        dashboardData.executionHistory.length
                      ),
                    },
                    {
                      range: '<60',
                      count: dashboardData.executionHistory.filter((e: any) => e.impact_score < 60).length,
                      percentage: safePercentage(
                        dashboardData.executionHistory.filter((e: any) => e.impact_score < 60).length,
                        dashboardData.executionHistory.length
                      ),
                    },
                  ].filter((item) => item.count > 0)
                : undefined
            }
          />
        </div>

        {/* AI Performance Chart */}
        <AIPerformance
          data={
            dashboardData?.executionHistory
              ? {
                  radar: [
                    { metric: 'Accuracy', score: 0, fullMark: 100 },
                    { metric: 'Speed', score: 0, fullMark: 100 },
                    { metric: 'Confidence', score: dashboardData.latestExecution?.confidence || 0, fullMark: 100 },
                    { metric: 'Impact', score: dashboardData.latestExecution?.impact_score || 0, fullMark: 100 },
                    { metric: 'Reliability', score: 0, fullMark: 100 },
                  ],
                  timeline: dashboardData.executionHistory.slice(0, 5).map((exec: any, index: number) => ({
                    time: new Date(exec.created_at || Date.now() - index * 60 * 60 * 1000).toLocaleTimeString(),
                    confidence: exec.confidence || 0,
                    accuracy: 0,
                    speed: 0,
                  })),
                }
              : undefined
          }
        />

        {/* Execution History */}
        <ExecutionHistory executions={dashboardData?.executionHistory} />
      </div>
    </div>
  );
}
