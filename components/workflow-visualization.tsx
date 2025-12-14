'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WorkflowDialog } from '@/components/workflow-dialog'
import { WorkflowPhase } from '@/components/reusable/WorkflowPhase'
import { 
  Download, 
  Database, 
  Brain, 
  Zap, 
  CheckCircle, 
  Target,
  FileText,
  Upload,
  ArrowRight
} from 'lucide-react'

interface WorkflowStep {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  status: 'pending' | 'running' | 'completed' | 'failed'
  duration?: string
}

interface WorkflowVisualizationProps {
  currentStep?: string
  executionData?: any
  latestExecution?: any
}

export function WorkflowVisualization({ currentStep, executionData, latestExecution }: WorkflowVisualizationProps) {
  // Determine workflow status based on latest execution
  const getStepStatus = (stepId: string, index: number) => {
    if (!latestExecution) return 'pending'
    
    const executionState = latestExecution.state?.current || 'CREATED'
    
    // Map execution states to workflow steps
    switch (executionState) {
      case 'CREATED':
      case 'RUNNING':
        return index === 0 ? 'running' : 'pending'
      case 'SUCCESS':
        return 'completed'
      case 'FAILED':
        return index === 0 ? 'failed' : 'pending'
      default:
        return 'pending'
    }
  }

  const workflowSteps: WorkflowStep[] = [
    {
      id: 'download_data',
      name: 'Download Data',
      description: 'Fetch data from source URL',
      icon: Download,
      status: getStepStatus('download_data', 0)
    },
    {
      id: 'clean_data',
      name: 'Clean Data',
      description: 'Process and validate dataset',
      icon: Database,
      status: getStepStatus('clean_data', 1)
    },
    {
      id: 'ai_analysis',
      name: 'AI Analysis',
      description: 'Generate insights with Perplexity AI',
      icon: Brain,
      status: getStepStatus('ai_analysis', 2)
    },
    {
      id: 'ai_decisions',
      name: 'AI Decisions',
      description: 'Create automated decisions',
      icon: Zap,
      status: getStepStatus('ai_decisions', 3)
    },
    {
      id: 'check_and_trigger',
      name: 'Threshold Check',
      description: 'Evaluate impact threshold',
      icon: Target,
      status: getStepStatus('check_and_trigger', 4)
    },
    {
      id: 'final_report',
      name: 'Generate Report',
      description: 'Create executive summary',
      icon: FileText,
      status: getStepStatus('final_report', 5)
    },
    {
      id: 'store_in_supabase',
      name: 'Store Results',
      description: 'Save to dashboard database',
      icon: Upload,
      status: getStepStatus('store_in_supabase', 6)
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'running': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'running': return <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse" />
      case 'failed': return <div className="h-4 w-4 rounded-full bg-red-500" />
      default: return <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600" />
    }
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-indigo-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Workflow Pipeline
              </CardTitle>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Processing steps
              </p>
            </div>
          </div>
          
          <WorkflowDialog>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <FileText className="h-3.5 w-3.5" />
            </Button>
          </WorkflowDialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {workflowSteps.map((step, index) => (
            <WorkflowPhase
              key={step.id}
              id={step.id}
              name={step.name}
              description={step.description}
              status={step.status}
              icon={<step.icon className="h-4 w-4" />}
              isLast={index === workflowSteps.length - 1}
            />
          ))}
        </div>

        {/* Workflow Summary */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Steps</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{workflowSteps.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {workflowSteps.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                {latestExecution ? (
                  latestExecution.state?.current === 'SUCCESS' ? 'Complete' :
                  latestExecution.state?.current === 'RUNNING' ? 'Running' :
                  latestExecution.state?.current === 'FAILED' ? 'Failed' : 'Created'
                ) : 'Ready'}
              </p>
            </div>
          </div>
          
          {latestExecution && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Latest Execution:</span>
                <span className="text-gray-900 dark:text-white">
                  {latestExecution.id?.slice(0, 8)}...
                </span>
              </div>
              {latestExecution.startDate && (
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-600 dark:text-gray-400">Started:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(latestExecution.startDate).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}