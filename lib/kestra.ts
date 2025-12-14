// lib/kestra-client.ts

export interface KestraExecution {
  id: string;
  state: {
    current: string;
    histories: Array<{
      state: string;
      date: string;
    }>;
  };
  flowId: string;
  namespace: string;
  startDate?: string;
  endDate?: string;
}

export interface TriggerWorkflowParams {
  dataSourceUrl?: string;
  decisionThreshold?: number;
}

export interface TriggerWorkflowResult {
  success: boolean;
  execution?: KestraExecution;
  error?: string;
  status?: number | string;
  details?: string;
  suggestion?: string;
}

// ✅ Trigger workflow via Next.js API
export async function triggerWakandaWorkflow(params: TriggerWorkflowParams = {}): Promise<TriggerWorkflowResult> {
  try {
    const response = await fetch('/api/kestra/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(10000) // 10 second timeout for trigger
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      // Return structured error response instead of throwing
      return {
        success: false,
        error: errorData.error || 'Failed to trigger workflow',
        status: response.status,
        details: errorData.details,
        suggestion: errorData.suggestion
      };
    }

    const execution = await response.json();
    return {
      success: true,
      execution: execution as KestraExecution
    };
  } catch (error) {
    console.error('Error triggering Kestra workflow:', error);
    
    // Return structured error response instead of throwing
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger workflow',
      status: 'network-error'
    };
  }
}

// ✅ Get execution status via Next.js API
export async function getExecutionStatus(executionId: string) {
  try {
    const response = await fetch(`/api/kestra/execution/${executionId}`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      throw new Error(errorData.error || 'Failed to get execution status');
    }

    const execution = await response.json();
    return execution as KestraExecution;
  } catch (error) {
    console.error('Error getting execution status:', error);
    throw error;
  }
}

// ✅ List recent executions via Next.js API
// Rate limiting for executions list
let lastExecutionsCheck = 0
const EXECUTIONS_CHECK_COOLDOWN = 2000 // 2 seconds minimum between checks

export async function listRecentExecutions(limit = 10) {
  // Rate limiting: prevent too frequent execution checks
  const now = Date.now()
  if (now - lastExecutionsCheck < EXECUTIONS_CHECK_COOLDOWN) {
    console.log('Executions list rate limited, skipping request')
    return []
  }
  lastExecutionsCheck = now

  try {
    const response = await fetch(`/api/kestra/executions?limit=${limit}`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      // Return empty array instead of throwing for server unavailability
      console.warn('Kestra executions API unavailable:', errorData.error);
      return [];
    }

    const data = await response.json();
    return data.results || data || [];
  } catch (error) {
    console.error('Error listing executions:', error);
    
    // Return empty array instead of throwing
    return [];
  }
}

// Rate limiting for health checks
let lastHealthCheck = 0
const HEALTH_CHECK_COOLDOWN = 2000 // 2 seconds minimum between checks

// ✅ Check Kestra health via Next.js API
export async function checkKestraHealth() {
  // Rate limiting: prevent too frequent health checks
  const now = Date.now()
  if (now - lastHealthCheck < HEALTH_CHECK_COOLDOWN) {
    console.log('Health check rate limited, using cached result')
    return {
      kestra: {
        healthy: false,
        error: 'Rate limited - too many health checks',
        status: 'rate-limited'
      },
      environment: {
        namespace: 'Unknown',
        flowId: 'Unknown'
      }
    };
  }
  lastHealthCheck = now

  try {
    const response = await fetch('/api/kestra/health', {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      return {
        kestra: {
          healthy: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        },
        environment: {
          namespace: 'Unknown',
          flowId: 'Unknown'
        }
      };
    }

    const health = await response.json();
    return health;
  } catch (error) {
    console.error('Error checking Kestra health:', error);
    
    // Return a structured error response instead of throwing
    return {
      kestra: {
        healthy: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        status: 'offline'
      },
      environment: {
        namespace: 'Unknown',
        flowId: 'Unknown'
      }
    };
  }
}
