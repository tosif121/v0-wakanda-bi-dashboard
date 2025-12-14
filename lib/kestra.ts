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
  recipientEmail?: string;
  decisionThreshold?: number;
}

// ✅ Trigger workflow via Next.js API
export async function triggerWakandaWorkflow(params: TriggerWorkflowParams = {}) {
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
      throw new Error(errorData.error || 'Failed to trigger workflow');
    }

    const execution = await response.json();
    return execution as KestraExecution;
  } catch (error) {
    console.error('Error triggering Kestra workflow:', error);
    throw error;
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
export async function listRecentExecutions(limit = 10) {
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

// ✅ Check Kestra health via Next.js API
export async function checkKestraHealth() {
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
