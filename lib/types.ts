export interface Execution {
  id: string
  status: string
  dataset_name: string
  dataset_rows: number
  impact_score: number
  confidence: number
  duration: string
  start_time: string
  created_at: string
  ai_insights?: AIInsight[]
  decisions?: Decision[]
}

export interface AIInsight {
  id: string
  execution_id: string
  summary: string
  insights: string[]
  recommendations: string[]
  created_at: string
}

export interface Decision {
  id: string
  execution_id: string
  impact_score: number
  confidence: number
  threshold: number
  urgent: boolean
  actions: string[]
  created_at: string
}

export interface DashboardStats {
  totalExecutions: number
  insightsGenerated: number
  automationsTriggered: number
  successRate: string | number
}

export interface DashboardData {
  stats: DashboardStats
  latestExecution: Execution | null
  executionHistory: Execution[]
}
