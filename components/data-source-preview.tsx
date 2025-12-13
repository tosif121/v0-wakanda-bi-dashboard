'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Globe, 
  Sheet, 
  Database, 
  FileText, 
  Play, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { detectDataSourceType, parseGoogleSheetsUrl } from '@/lib/google-sheets'
import { triggerWakandaWorkflow } from '@/lib/kestra'

interface DataSourcePreviewProps {
  url: string
  onProcess?: (result: any) => void
}

export function DataSourcePreview({ url, onProcess }: DataSourcePreviewProps) {
  const [preview, setPreview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true)
      setError('')

      try {
        // Detect source type
        const sourceInfo = detectDataSourceType(url)
        
        // For Google Sheets, convert to CSV URL
        let processUrl = url
        let sheetsInfo = null
        
        if (sourceInfo.type === 'google-sheets') {
          sheetsInfo = parseGoogleSheetsUrl(url)
          if (sheetsInfo) {
            processUrl = sheetsInfo.csvUrl
          }
        }

        // Try to fetch a small sample of the data
        let sampleData = null
        try {
          const response = await fetch(`/api/preview-data?url=${encodeURIComponent(processUrl)}`)
          if (response.ok) {
            sampleData = await response.json()
          }
        } catch (err) {
          console.warn('Could not fetch preview data:', err)
        }

        setPreview({
          sourceInfo,
          sheetsInfo,
          processUrl,
          sampleData
        })
      } catch (err) {
        setError('Failed to analyze data source')
        console.error('Preview error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPreview()
  }, [url])

  const handleProcess = async () => {
    if (!preview?.processUrl) return
    
    setIsProcessing(true)
    try {
      const execution = await triggerWakandaWorkflow({
        dataSourceUrl: preview.processUrl,
        recipientEmail: 'executive@company.com',
        decisionThreshold: 75
      })
      
      onProcess?.(execution)
    } catch (error) {
      console.error('Processing failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'google-sheets': return Sheet
      case 'github-raw': return Database
      case 'csv-file': return FileText
      case 'json-file': return FileText
      default: return Globe
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Analyzing data source...
            </span>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Preview Error</span>
          </div>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!preview) return null

  const SourceIcon = getSourceIcon(preview.sourceInfo.type)

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600">
              <SourceIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Data Preview
              </CardTitle>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {new URL(url).hostname}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Badge 
              variant="outline" 
              className={`text-xs ${
                preview.sourceInfo.confidence > 0.8 
                  ? 'border-green-500 text-green-700 dark:text-green-400' 
                  : 'border-yellow-500 text-yellow-700 dark:text-yellow-400'
              }`}
            >
              {Math.round(preview.sourceInfo.confidence * 100)}%
            </Badge>
            
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              size="sm"
              className="gap-1.5 h-7 px-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-xs">Processing...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span className="text-xs">Analyze</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Source Details */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Source Type</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{preview.sourceInfo.type}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {preview.processUrl !== url ? 'Auto-converted' : 'Direct access'}
            </p>
          </div>
        </div>

        {/* Google Sheets specific info */}
        {preview.sheetsInfo && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Sheet className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-800 dark:text-blue-400">
                Google Sheets Detected
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Will be converted to CSV format for processing
            </p>
          </div>
        )}

        {/* Data Preview */}
        {preview.sampleData && preview.sampleData.headers && preview.sampleData.rows ? (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Sample Data ({preview.sampleData.totalRows || 'Unknown'} rows)
            </h4>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
                      {preview.sampleData.headers.slice(0, 4).map((header: string, index: number) => (
                        <th key={index} className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">
                          {header.length > 15 ? `${header.substring(0, 15)}...` : header}
                        </th>
                      ))}
                      {preview.sampleData.headers.length > 4 && (
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                          +{preview.sampleData.headers.length - 4} more
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sampleData.rows.slice(0, 3).map((row: string[], rowIndex: number) => (
                      <tr key={rowIndex} className="border-b border-gray-100 dark:border-gray-800">
                        {row.slice(0, 4).map((cell: string, cellIndex: number) => (
                          <td key={cellIndex} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                            {cell && cell.length > 20 ? `${cell.substring(0, 20)}...` : cell || '-'}
                          </td>
                        ))}
                        {row.length > 4 && (
                          <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                            ...
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : preview.sampleData && !preview.sampleData.headers ? (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800 dark:text-yellow-400">
                Data source detected but preview not available
              </span>
            </div>
          </div>
        ) : null}

        {/* External Link */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(url, '_blank')}
            className="gap-1.5 text-gray-600 dark:text-gray-400 h-7 px-2"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="text-xs">View Source</span>
          </Button>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-xs">Ready</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}