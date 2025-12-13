import { Button } from '@/components/ui/button';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GitBranch, Download, User, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface DashboardHeaderProps {
  onRefresh?: () => void;
  dashboardData?: any;
}

export function DashboardHeader({ onRefresh, dashboardData }: DashboardHeaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      // Generate HTML content for the PDF report
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();

      // Generate stats section
      const statsHtml = dashboardData?.stats
        ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #4f46e5; border-left: 3px solid #6366f1; padding-left: 12px; margin-bottom: 15px; font-size: 16px;">Dashboard Statistics</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 3px solid #6366f1; margin-bottom: 8px;">
              <h3 style="margin: 0 0 6px 0; color: #4f46e5; font-size: 12px;">Total Executions</h3>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${
                dashboardData.stats.totalExecutions || 0
              }</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 3px solid #10b981; margin-bottom: 8px;">
              <h3 style="margin: 0 0 6px 0; color: #059669; font-size: 12px;">Insights Generated</h3>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${
                dashboardData.stats.insightsGenerated || 0
              }</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 3px solid #f59e0b; margin-bottom: 8px;">
              <h3 style="margin: 0 0 6px 0; color: #d97706; font-size: 12px;">Automations Triggered</h3>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${
                dashboardData.stats.automationsTriggered || 0
              }</p>
            </div>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 3px solid #ef4444; margin-bottom: 8px;">
              <h3 style="margin: 0 0 6px 0; color: #dc2626; font-size: 12px;">Success Rate</h3>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">${
                dashboardData.stats.successRate || '0'
              }%</p>
            </div>
          </div>
        </div>
      `
        : '';

      // Generate latest execution section
      const latestExecutionHtml = dashboardData?.latestExecution
        ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #4f46e5; border-left: 3px solid #6366f1; padding-left: 12px; margin-bottom: 15px; font-size: 16px;">Latest Execution</h2>
          <div style="background: #f8fafc; padding: 18px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 15px;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
              <div style="margin-bottom: 8px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #374151; font-size: 11px;">Execution ID:</p>
                <p style="margin: 0; color: #6b7280; font-size: 12px;">${dashboardData.latestExecution.id || 'N/A'}</p>
              </div>
              <div style="margin-bottom: 8px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #374151; font-size: 11px;">Status:</p>
                <p style="margin: 0; color: #6b7280; font-size: 12px;">${
                  dashboardData.latestExecution.status || 'N/A'
                }</p>
              </div>
              <div style="margin-bottom: 8px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #374151; font-size: 11px;">Dataset:</p>
                <p style="margin: 0; color: #6b7280; font-size: 12px;">${
                  dashboardData.latestExecution.dataset_name || 'N/A'
                }</p>
              </div>
              <div style="margin-bottom: 8px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #374151; font-size: 11px;">Rows Processed:</p>
                <p style="margin: 0; color: #6b7280; font-size: 12px;">${
                  dashboardData.latestExecution.dataset_rows || 0
                }</p>
              </div>
              <div style="margin-bottom: 8px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #374151; font-size: 11px;">Impact Score:</p>
                <p style="margin: 0; color: #6b7280; font-size: 12px;">${
                  dashboardData.latestExecution.impact_score || 0
                }/100</p>
              </div>
              <div style="margin-bottom: 8px;">
                <p style="margin: 0 0 5px 0; font-weight: bold; color: #374151; font-size: 11px;">Confidence:</p>
                <p style="margin: 0; color: #6b7280; font-size: 12px;">${
                  dashboardData.latestExecution.confidence || 0
                }%</p>
              </div>
            </div>
          </div>
        </div>
      `
        : '';

      // Generate execution history table
      const executionHistoryHtml =
        dashboardData?.executionHistory?.length > 0
          ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #4f46e5; border-left: 3px solid #6366f1; padding-left: 12px; margin-bottom: 15px; font-size: 16px;">Execution History</h2>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 15px;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600; font-size: 11px;">ID</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600; font-size: 11px;">Dataset</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600; font-size: 11px;">Rows</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600; font-size: 11px;">Impact</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600; font-size: 11px;">Status</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600; font-size: 11px;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${dashboardData.executionHistory
                .map(
                  (execution: any, index: number) => `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 10px; color: #6b7280; font-size: 10px;">${
                    execution.id?.substring(0, 8) || 'N/A'
                  }</td>
                  <td style="padding: 10px; color: #6b7280; font-size: 10px;">${execution.dataset_name || 'N/A'}</td>
                  <td style="padding: 10px; color: #6b7280; font-size: 10px;">${execution.dataset_rows || 0}</td>
                  <td style="padding: 10px; color: #6b7280; font-size: 10px;">${execution.impact_score || 0}/100</td>
                  <td style="padding: 10px;">
                    <span style="padding: 4px 8px; border-radius: 3px; font-size: 9px; font-weight: 500; 
                      ${
                        execution.status === 'success'
                          ? 'background: #dcfce7; color: #166534;'
                          : execution.status === 'running'
                          ? 'background: #fef3c7; color: #92400e;'
                          : 'background: #fee2e2; color: #991b1b;'
                      }">
                      ${execution.status || 'unknown'}
                    </span>
                  </td>
                  <td style="padding: 10px; color: #6b7280; font-size: 10px;">${
                    execution.created_at ? new Date(execution.created_at).toLocaleDateString() : 'N/A'
                  }</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `
          : '';

      // Generate AI insights section
      const aiInsightsHtml =
        dashboardData?.latestExecution?.ai_insights?.length > 0
          ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #4f46e5; border-left: 3px solid #6366f1; padding-left: 12px; margin-bottom: 15px; font-size: 16px;">AI Insights</h2>
          ${dashboardData.latestExecution.ai_insights
            .map(
              (insight: any) => `
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 15px;">
              <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 12px; font-weight: bold;">Summary:</h3>
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 11px; line-height: 1.4;">${
                insight.summary || 'No summary available'
              }</p>
              
              ${
                insight.insights?.length > 0
                  ? `
                <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 12px; font-weight: bold;">Key Insights:</h3>
                <ul style="margin: 0 0 12px 0; padding-left: 15px; color: #6b7280; font-size: 11px; line-height: 1.4;">
                  ${insight.insights.map((item: string) => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
                </ul>
              `
                  : ''
              }
              
              ${
                insight.recommendations?.length > 0
                  ? `
                <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 12px; font-weight: bold;">Recommendations:</h3>
                <ul style="margin: 0; padding-left: 15px; color: #6b7280; font-size: 11px; line-height: 1.4;">
                  ${insight.recommendations
                    .map((item: string) => `<li style="margin-bottom: 4px;">${item}</li>`)
                    .join('')}
                </ul>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      `
          : '';

      // Generate decisions section
      const decisionsHtml =
        dashboardData?.latestExecution?.decisions?.length > 0
          ? `
        <div style="margin-bottom: 25px;">
          <h2 style="color: #4f46e5; border-left: 3px solid #6366f1; padding-left: 12px; margin-bottom: 15px; font-size: 16px;">Automated Decisions</h2>
          ${dashboardData.latestExecution.decisions
            .map(
              (decision: any) => `
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 15px;">
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px;">
                <div style="margin-bottom: 8px;">
                  <p style="margin: 0 0 5px 0; font-weight: bold; color: #374151; font-size: 11px;">Impact Score:</p>
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">${decision.impact_score || 0}/100</p>
                </div>
                <div style="margin-bottom: 8px;">
                  <p style="margin: 0 0 5px 0; font-weight: bold; color: #374151; font-size: 11px;">Confidence:</p>
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">${decision.confidence || 0}%</p>
                </div>
                <div style="margin-bottom: 8px;">
                  <p style="margin: 0 0 5px 0; font-weight: bold; color: #374151; font-size: 11px;">Threshold:</p>
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">${decision.threshold || 0}/100</p>
                </div>
                <div style="margin-bottom: 8px;">
                  <p style="margin: 0 0 5px 0; font-weight: bold; color: #374151; font-size: 11px;">Urgent:</p>
                  <p style="margin: 0; color: #6b7280; font-size: 12px;">${decision.urgent ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              ${
                decision.actions?.length > 0
                  ? `
                <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 12px; font-weight: bold;">Recommended Actions:</h3>
                <ul style="margin: 0; padding-left: 15px; color: #6b7280; font-size: 11px; line-height: 1.4;">
                  ${decision.actions.map((action: string) => `<li style="margin-bottom: 4px;">${action}</li>`).join('')}
                </ul>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      `
          : '';

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 15px; color: #333;">
          <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #6366f1; padding-bottom: 15px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 22px;">Wakanda BI Engine Report</h1>
            <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">AI-Powered Business Intelligence Results</p>
            <p style="margin: 4px 0 0 0; color: #888; font-size: 12px;">Generated on ${currentDate} at ${currentTime}</p>
          </div>

          ${statsHtml}
          ${latestExecutionHtml}
          ${aiInsightsHtml}
          ${decisionsHtml}
          ${executionHistoryHtml}

          <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="color: #888; font-size: 10px; margin: 0;">
              Generated by Wakanda BI Engine • Powered by AI
            </p>
          </div>
        </div>
      `;

      // Call your PDF generation API with htmlContent
      const response = await fetch('https://pacsdev.iotcom.io/pdfgen/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ htmlContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wakanda-bi-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Handle error silently in production or show user-friendly message
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <header className="sticky top-0 z-50 overflow-hidden rounded-xl bg-linear-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 p-4 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-slate-950/80">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            {/* Compact Purple gradient "W" icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-linear-to-br from-purple-500 to-blue-600 blur-md opacity-50"></div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-blue-600 shadow-lg hover:scale-105 transition-transform duration-200">
                <span className="text-lg font-bold text-white drop-shadow-lg">W</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Wakanda BI Engine
                </h1>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                AI-Powered Business Intelligence Platform
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 hover:scale-105 transition-transform duration-200 h-8 px-3"
                onClick={onRefresh}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden lg:inline text-xs">Refresh</span>
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 hover:scale-105 transition-transform duration-200 h-8 px-3"
              onClick={() => window.open('http://localhost:8080', '_blank')}
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span className="hidden lg:inline text-xs">Workflow</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 hover:scale-105 transition-transform duration-200 h-8 px-3"
              onClick={handleDownloadReport}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span className="hidden lg:inline text-xs">{isDownloading ? 'Generating...' : 'Download'}</span>
            </Button>
          </div>

          <div className="flex items-center gap-1.5 border-l border-gray-200/50 dark:border-gray-700/50 pl-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 px-0 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 transition-all duration-200"
            >
              <User className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
              <span className="sr-only">User menu</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
