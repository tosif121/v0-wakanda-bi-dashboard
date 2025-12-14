'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'

import { 
  Upload, 
  Link, 
  Database, 
  Play, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Globe,
  Sheet,
  X,
  Settings
} from 'lucide-react'

import { triggerWakandaWorkflow } from '@/lib/kestra'
import { useKestraConnectionContext } from '@/lib/kestra-connection-context'

interface DataSourceSelectorProps {
  onDataProcessed?: (result: any) => void
}

export function DataSourceSelector({ onDataProcessed }: DataSourceSelectorProps) {
  const [activeTab, setActiveTab] = useState('upload')
  const [urlInput, setUrlInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingResult, setProcessingResult] = useState<any>(null)
  const [urlError, setUrlError] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [decisionThreshold, setDecisionThreshold] = useState(75)
  
  const connection = useKestraConnectionContext()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setUploadError('')
      
      // Upload file
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
          toast.success('File uploaded successfully!', { icon: '📁' })
        } else {
          setUploadError('Failed to upload file')
          toast.error('Failed to upload file')
        }
      } catch (error) {
        setUploadError('Upload failed. Please try again.')
        toast.error('Upload failed. Please try again.')
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'text/plain': ['.csv']
    },
    maxFiles: 1
  })

  const handleFileProcess = async () => {
    if (!uploadUrl) return
    
    // Check if Kestra is connected
    if (!connection.isConnected) {
      toast.error('Kestra server is offline. Please start the server and try again.')
      setUploadError('Kestra server is not available')
      return
    }
    
    setIsProcessing(true)
    setUploadError('')
    
    // Show processing toast
    toast.loading('Starting AI analysis...', { id: 'file-process' })
    
    try {
      console.log('Triggering workflow with URL:', uploadUrl)
      const result = await triggerWakandaWorkflow({
        dataSourceUrl: uploadUrl,
        decisionThreshold: decisionThreshold
      })
      
      if (result.success && result.execution) {
        console.log('Workflow triggered successfully:', result.execution)
        setProcessingResult(result.execution)
        onDataProcessed?.(result.execution)
        
        // Dismiss processing toast
        toast.dismiss('file-process')
        
        // Clear the success message after 5 seconds
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          setProcessingResult(null)
          timeoutRef.current = null
        }, 5000)
      } else {
        throw new Error(result.error || 'Failed to trigger workflow')
      }
      
    } catch (error) {
      console.error('Workflow trigger failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setUploadError(`Processing failed: ${errorMessage}`)
      toast.dismiss('file-process')
      toast.error(`Workflow failed: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
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

    // Check if Kestra is connected
    if (!connection.isConnected) {
      toast.error('Kestra server is offline. Please start the server and try again.')
      setUrlError('Kestra server is not available')
      return
    }

    setUrlError('')
    setIsProcessing(true)
    
    // Show processing toast
    toast.loading('Starting AI analysis...', { id: 'url-process' })

    try {
      // Convert Google Sheets URL if needed
      const processUrl = convertGoogleSheetsUrl(urlInput)
      
      console.log('Triggering workflow with URL:', processUrl)
      const result = await triggerWakandaWorkflow({
        dataSourceUrl: processUrl,
        decisionThreshold: decisionThreshold
      })
      
      if (result.success && result.execution) {
        console.log('Workflow triggered successfully:', result.execution)
        setProcessingResult(result.execution)
        onDataProcessed?.(result.execution)
        
        // Dismiss processing toast
        toast.dismiss('url-process')
      } else {
        throw new Error(result.error || 'Failed to trigger workflow')
      }
      
      // Clear the success message after 5 seconds
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setProcessingResult(null)
        timeoutRef.current = null
      }, 5000)
      
    } catch (error) {
      console.error('Workflow trigger failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setUrlError(`Failed to process URL: ${errorMessage}`)
      toast.dismiss('url-process')
      toast.error(`Workflow failed: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadUrl(null)
    setUploadError('')
    setProcessingResult(null)
  }



  const sourceType = urlInput ? detectDataSourceType(urlInput) : null

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600">
              <Database className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Data Sources
              </CardTitle>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Upload files or paste URLs
              </p>
            </div>
          </div>
          
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${
              connection.isConnected ? 'bg-emerald-500' : 'bg-red-500'
            } ${connection.isChecking ? 'animate-pulse' : ''}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {connection.isChecking ? 'Checking...' : connection.isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Configuration Section */}
        <div className="space-y-4 mb-4 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              Decision Threshold
            </Label>
          </div>
          
          <div className="space-y-4">
            {/* Threshold Slider */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Decision Threshold
                </span>
                <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {decisionThreshold}%
                </span>
              </Label>
              <Slider
                value={[decisionThreshold]}
                onValueChange={(value) => setDecisionThreshold(value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Conservative (0%)</span>
                <span>Aggressive (100%)</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI actions trigger when impact score ≥ {decisionThreshold}%
                {decisionThreshold >= 90 && " (Very Conservative)"}
                {decisionThreshold >= 70 && decisionThreshold < 90 && " (Balanced)"}
                {decisionThreshold >= 50 && decisionThreshold < 70 && " (Moderate)"}
                {decisionThreshold < 50 && " (Aggressive)"}
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="upload" className="gap-1.5 text-xs">
              <Upload className="h-3.5 w-3.5" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-1.5 text-xs">
              <Link className="h-3.5 w-3.5" />
              URL/Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-3">
            {!uploadedFile ? (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-primary">Upload CSV File</Label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  {isDragActive ? (
                    <p className="text-purple-600 dark:text-purple-400 font-medium">
                      Drop your CSV file here...
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Drag & drop your CSV file here, or click to select
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports CSV files up to 10MB
                      </p>
                    </div>
                  )}
                </div>
                
                {uploadError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {uploadError}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-purple-600 dark:text-purple-400">File Ready</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-7 px-2"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="text-xs ml-1">Remove</span>
                  </Button>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {uploadedFile.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Size: {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                  {uploadUrl && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Uploaded successfully
                    </p>
                  )}
                </div>
                
                {uploadUrl && (
                  <Button
                    onClick={handleFileProcess}
                    disabled={isProcessing || !connection.isConnected}
                    size="sm"
                    className={`w-full gap-1.5 h-8 text-white disabled:opacity-50 ${
                      !connection.isConnected 
                        ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:hover:bg-red-400' 
                        : 'bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span className="text-xs">Processing...</span>
                      </>
                    ) : !connection.isConnected ? (
                      <>
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span className="text-xs">Server Offline</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span className="text-xs">Analyze File</span>
                      </>
                    )}
                  </Button>
                )}
                
                {/* File Processing Result */}
                {processingResult && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
                        Workflow Triggered!
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      ID: <code className="bg-emerald-100 dark:bg-emerald-800 px-1 rounded text-xs">{processingResult.id?.slice(0, 12)}...</code>
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <AlertCircle className="h-3 w-3" />
                        <span>Threshold: {decisionThreshold}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span>Dashboard will update automatically with results</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">URL Preview</Label>
                    <Button
                      onClick={handleUrlProcess}
                      disabled={isProcessing || !connection.isConnected}
                      size="sm"
                      className={`gap-1.5 h-7 px-3 text-white disabled:opacity-50 ${
                        !connection.isConnected 
                          ? 'bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:hover:bg-red-400' 
                          : 'bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span className="text-xs">Processing...</span>
                        </>
                      ) : !connection.isConnected ? (
                        <>
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span className="text-xs">Server Offline</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" />
                          <span className="text-xs">Analyze</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {sourceType && <sourceType.icon className="h-4 w-4 text-blue-600" />}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {sourceType?.label || 'Web URL'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new URL(urlInput).hostname}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ URL validated and ready to process
                    </p>
                  </div>
                </div>
              )}

              {/* URL Processing Result */}
              {processingResult && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800 dark:text-emerald-400">
                      Workflow Triggered Successfully!
                    </span>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Execution ID: <code className="bg-emerald-100 dark:bg-emerald-800 px-1 rounded">{processingResult.id}</code>
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <Settings className="h-3 w-3" />
                      <span>Threshold: {decisionThreshold}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span>Dashboard will update automatically with results</span>
                    </div>
                  </div>
                </div>
              )}

              {!urlInput && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Supported formats:</Label>
                  <div className="grid gap-1 text-xs">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Sheet className="h-3 w-3" />
                      <span>Google Sheets, Direct CSV, GitHub Raw files</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>


        </Tabs>
      </CardContent>
    </Card>
  )
}