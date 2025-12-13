'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
}

export function WorkflowVisualization({ currentStep, executionData }: WorkflowVisualizationProps) {
  const workflowSteps: WorkflowStep[] = [
    {
      id: 'download_data',
      name: 'Download Data',
      description: 'Fetch data from source URL',
      icon: Download,
      status: currentStep === 'download_data' ? 'running' : 'completed'
    },
    {
      id: 'clean_data',
      name: 'Clean Data',
      description: 'Process and validate dataset',
      icon: Database,
      status: currentStep === 'clean_data' ? 'running' : currentStep ? 'completed' : 'pending'
    },
    {
      id: 'ai_analysis',
      name: 'AI Analysis',
      description: 'Generate insights with Perplexity AI',
      icon: Brain,
      status: currentStep === 'ai_analysis' ? 'running' : 'pending'
    },
    {
      id: 'ai_decisions',
      name: 'AI Decisions',
      description: 'Create automated decisions',
      icon: Zap,
      status: currentStep === 'ai_decisions' ? 'running' : 'pending'
    },
    {
      id: 'check_and_trigger',
      name: 'Threshold Check',
      description: 'Evaluate impact threshold',
      icon: Target,
      status: currentStep === 'check_and_trigger' ? 'running' : 'pending'
    },
    {
      id: 'final_report',
      name: 'Generate Report',
      description: 'Create executive summary',
      icon: FileText,
      status: currentStep === 'final_report' ? 'running' : 'pending'
    },
    {
      id: 'store_in_supabase',
      name: 'Store Results',
      description: 'Save to dashboard database',
      icon: Upload,
      status: currentStep === 'store_in_supabase' ? 'running' : 'pending'
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
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-indigo-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Workflow Pipeline
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Wakanda BI Engine processing steps
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className="flex items-center gap-4">
                {/* Step Icon */}
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  step.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  step.status === 'running' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  step.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <step.icon className={`h-5 w-5 ${
                    step.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                    step.status === 'running' ? 'text-blue-600 dark:text-blue-400' :
                    step.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-500 dark:text-gray-400'
                  }`} />
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {step.name}
                    </h4>
                    <Badge className={getStatusColor(step.status)} variant="outline">
                      {step.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                  {step.duration && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Duration: {step.duration}
                    </p>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="flex items-center">
                  {getStatusIcon(step.status)}
                </div>
              </div>

              {/* Connection Line */}
              {index < workflowSteps.length - 1 && (
                <div className="absolute left-5 top-10 w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
              )}
            </div>
          ))}
        </div>

        {/* Workflow Summary */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Steps</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{workflowSteps.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {workflowSteps.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Est. Duration</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">~2min</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}