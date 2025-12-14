'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WorkflowDialog } from '@/components/workflow-dialog'
import { WorkflowPhase } from '@/components/reusable/WorkflowPhase'
import moment from 'moment'
import { 
  Download, 
  Database, 
  Brain, 
  Zap, 
  CheckCircle, 
  Target,
  FileText,
  Upload,
  Sparkles
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
  onProgressClear?: () => void
}

export function WorkflowVisualization({ latestExecution, onProgressClear }: WorkflowVisualizationProps) {
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false)
  const [previousExecutionId, setPreviousExecutionId] = useState<string | null>(null)

  // Check for workflow completion
  useEffect(() => {
    if (latestExecution && latestExecution.state?.current === 'SUCCESS') {
      const currentExecutionId = latestExecution.id
      
      // Only show celebration if this is a new completion
      if (currentExecutionId !== previousExecutionId) {
        setShowCompletionCelebration(true)
        setPreviousExecutionId(currentExecutionId)
        
        // Clear celebration and progress after 6 seconds
        setTimeout(() => {
          setShowCompletionCelebration(false)
          onProgressClear?.()
        }, 6000)
      }
    }
  }, [latestExecution, previousExecutionId, onProgressClear])

  // Determine workflow status based on latest execution
  const getStepStatus = (_stepId: string, index: number) => {
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
        {/* Completion Celebration */}
        {showCompletionCelebration && (
          <div className="mb-4 p-4 bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800 shadow-lg animate-in fade-in-0 slide-in-from-left-2 duration-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 animate-bounce">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 dark:text-purple-300">
                  🎉 Workflow Complete!
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  All steps executed successfully
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white dark:bg-slate-800 rounded animate-in fade-in-0 duration-1000 delay-200">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">✓</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Processed</div>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded animate-in fade-in-0 duration-1000 delay-400">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">✓</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Analyzed</div>
              </div>
              <div className="p-2 bg-white dark:bg-slate-800 rounded animate-in fade-in-0 duration-1000 delay-600">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">✓</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Stored</div>
              </div>
            </div>
          </div>
        )}

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
                    {moment(latestExecution.startDate).format('h:mm:ss A')}
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