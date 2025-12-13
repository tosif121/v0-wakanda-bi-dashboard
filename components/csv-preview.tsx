'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Eye, Play } from 'lucide-react'
import { triggerWakandaWorkflow } from '@/lib/kestra'

interface CSVPreviewProps {
  file: File
  onProcess?: (result: any) => void
}

export function CSVPreview({ file, onProcess }: CSVPreviewProps) {
  const [preview, setPreview] = useState<{
    headers: string[]
    rows: string[][]
    totalRows: number
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0]?.split(',').map(h => h.trim()) || []
      const rows = lines.slice(1, 6).map(line => 
        line.split(',').map(cell => cell.trim())
      )
      
      setPreview({
        headers,
        rows,
        totalRows: lines.length - 1
      })
    }
    reader.readAsText(file)

    // Upload file
    const uploadFile = async () => {
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const response = await fetch('/api/upload-csv', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const result = await response.json()
          setUploadUrl(result.url)
        }
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }

    uploadFile()
  }, [file])

  const handleProcess = async () => {
    if (!uploadUrl) return
    
    setIsProcessing(true)
    try {
      const execution = await triggerWakandaWorkflow({
        dataSourceUrl: uploadUrl,
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

  if (!preview) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {file.name}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {preview.totalRows.toLocaleString()} rows • {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          
          {uploadUrl && (
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="gap-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Data Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Data Preview
            </h4>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-slate-800">
                    {preview.headers.map((header, index) => (
                      <TableHead key={index} className="text-xs font-medium">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex} className="text-xs">
                          {cell.length > 20 ? `${cell.substring(0, 20)}...` : cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {preview.totalRows > 5 && (
              <p className="text-xs text-gray-500 mt-2">
                Showing first 5 rows of {preview.totalRows.toLocaleString()} total rows
              </p>
            )}
          </div>

          {/* Column Summary */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Column Summary
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs">
                <span className="text-gray-600 dark:text-gray-400">Columns:</span>
                <span className="ml-1 font-medium">{preview.headers.length}</span>
              </div>
              <div className="text-xs">
                <span className="text-gray-600 dark:text-gray-400">Rows:</span>
                <span className="ml-1 font-medium">{preview.totalRows.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}