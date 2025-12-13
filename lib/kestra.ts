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
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to trigger workflow');
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
    const response = await fetch(`/api/kestra/execution/${executionId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get execution status');
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
    const response = await fetch(`/api/kestra/executions?limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list executions');
    }

    const data = await response.json();
    return data.results as KestraExecution[];
  } catch (error) {
    console.error('Error listing executions:', error);
    throw error;
  }
}

// ✅ Check Kestra health via Next.js API
export async function checkKestraHealth() {
  try {
    const response = await fetch('/api/kestra/health');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check Kestra health');
    }

    const health = await response.json();
    return health;
  } catch (error) {
    console.error('Error checking Kestra health:', error);
    throw error;
  }
}
