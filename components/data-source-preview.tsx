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
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Analyzing data source...
            </span>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!preview) return null

  const SourceIcon = getSourceIcon(preview.sourceInfo.type)

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600">
              <SourceIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {preview.sourceInfo.description}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new URL(url).hostname}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${
                preview.sourceInfo.confidence > 0.8 
                  ? 'border-green-500 text-green-700 dark:text-green-400' 
                  : 'border-yellow-500 text-yellow-700 dark:text-yellow-400'
              }`}
            >
              {Math.round(preview.sourceInfo.confidence * 100)}% confidence
            </Badge>
            
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="gap-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Source Details */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Source Type</p>
            <p className="font-medium text-gray-900 dark:text-white">{preview.sourceInfo.type}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Processing URL</p>
            <p className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate">
              {preview.processUrl !== url ? 'Converted to CSV' : 'Direct access'}
            </p>
          </div>
        </div>

        {/* Google Sheets specific info */}
        {preview.sheetsInfo && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Sheet className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-400">
                Google Sheets Integration
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Sheet ID: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{preview.sheetsInfo.sheetId}</code>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Data will be automatically converted to CSV format for processing.
            </p>
          </div>
        )}

        {/* Data Preview */}
        {preview.sampleData && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Data Preview
            </h4>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-slate-800">
                    {preview.sampleData.headers?.map((header: string, index: number) => (
                      <TableHead key={index} className="text-xs font-medium">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.sampleData.rows?.slice(0, 3).map((row: string[], rowIndex: number) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell: string, cellIndex: number) => (
                        <TableCell key={cellIndex} className="text-xs">
                          {cell.length > 20 ? `${cell.substring(0, 20)}...` : cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {preview.sampleData.totalRows && (
              <p className="text-xs text-gray-500 mt-2">
                Showing preview • Estimated {preview.sampleData.totalRows} total rows
              </p>
            )}
          </div>
        )}

        {/* External Link */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(url, '_blank')}
            className="gap-2 text-gray-600 dark:text-gray-400"
          >
            <ExternalLink className="h-3 w-3" />
            View Original Source
          </Button>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Ready to process
          </div>
        </div>
      </CardContent>
    </Card>
  )
}