'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Link, 
  Database, 
  Play, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Globe,
  Sheet
} from 'lucide-react'
import { FileUpload } from './file-upload'
import { DataSourcePreview } from './data-source-preview'
import { triggerWakandaWorkflow } from '@/lib/kestra'

interface DataSourceSelectorProps {
  onDataProcessed?: (result: any) => void
}

export function DataSourceSelector({ onDataProcessed }: DataSourceSelectorProps) {
  const [activeTab, setActiveTab] = useState('upload')
  const [urlInput, setUrlInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingResult, setProcessingResult] = useState<any>(null)
  const [urlError, setUrlError] = useState('')

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const detectDataSourceType = (url: string) => {
    if (url.includes('docs.google.com/spreadsheets')) {
      return { type: 'google-sheets', icon: Sheet, label: 'Google Sheets' }
    }
    if (url.includes('github.com') || url.includes('raw.githubusercontent.com')) {
      return { type: 'github', icon: Database, label: 'GitHub' }
    }
    if (url.includes('kaggle.com')) {
      return { type: 'kaggle', icon: Database, label: 'Kaggle' }
    }
    if (url.endsWith('.csv') || url.endsWith('.json') || url.endsWith('.xlsx')) {
      return { type: 'direct-file', icon: FileText, label: 'Direct File' }
    }
    return { type: 'web-url', icon: Globe, label: 'Web URL' }
  }

  const convertGoogleSheetsUrl = (url: string) => {
    // Convert Google Sheets URL to CSV export URL
    if (url.includes('docs.google.com/spreadsheets')) {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
      if (match) {
        const sheetId = match[1]
        return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`
      }
    }
    return url
  }

  const handleUrlProcess = async () => {
    if (!urlInput.trim()) {
      setUrlError('Please enter a URL')
      return
    }

    if (!validateUrl(urlInput)) {
      setUrlError('Please enter a valid URL')
      return
    }

    setUrlError('')
    setIsProcessing(true)

    try {
      // Convert Google Sheets URL if needed
      const processUrl = convertGoogleSheetsUrl(urlInput)
      
      const execution = await triggerWakandaWorkflow({
        dataSourceUrl: processUrl,
        recipientEmail: 'executive@company.com',
        decisionThreshold: 75
      })
      
      setProcessingResult(execution)
      onDataProcessed?.(execution)
    } catch (error) {
      console.error('Processing failed:', error)
      setUrlError('Failed to process URL. Please check the URL and try again.')
    } finally {
      setIsProcessing(false)
    }
  }



  const sourceType = urlInput ? detectDataSourceType(urlInput) : null

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Sources
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload files, paste URLs, or connect to Google Sheets
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <Link className="h-4 w-4" />
              URL/Link
            </TabsTrigger>

          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <FileUpload onFileProcessed={onDataProcessed} />
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="data-url">Data Source URL</Label>
                <div className="space-y-2">
                  <Input
                    id="data-url"
                    placeholder="Paste Google Sheets URL, CSV link, or any data URL..."
                    value={urlInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setUrlInput(e.target.value)
                      setUrlError('')
                    }}
                    className={urlError ? 'border-red-500' : ''}
                  />
                  {urlError && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {urlError}
                    </div>
                  )}
                </div>
              </div>

              {urlInput && validateUrl(urlInput) && !urlError && (
                <DataSourcePreview 
                  url={urlInput}
                  onProcess={(result) => {
                    setProcessingResult(result)
                    onDataProcessed?.(result)
                  }}
                />
              )}

              {/* URL Processing Result */}
              {processingResult && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800 dark:text-emerald-400">
                      Processing Started Successfully!
                    </span>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Execution ID: <code className="bg-emerald-100 dark:bg-emerald-800 px-1 rounded">{processingResult.id}</code>
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Check the dashboard for real-time updates as your data is processed.
                  </p>
                </div>
              )}

              {/* URL Examples */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600 dark:text-gray-400">Supported URL formats:</Label>
                <div className="grid gap-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Sheet className="h-3 w-3" />
                    <span>Google Sheets: docs.google.com/spreadsheets/...</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FileText className="h-3 w-3" />
                    <span>Direct CSV: example.com/data.csv</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Database className="h-3 w-3" />
                    <span>GitHub Raw: raw.githubusercontent.com/...</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>


        </Tabs>
      </CardContent>
    </Card>
  )
}