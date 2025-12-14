'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, File, X, Play, CheckCircle } from 'lucide-react'
import { CSVPreview } from './csv-preview'
import { triggerWakandaWorkflow } from '@/lib/kestra'

interface FileUploadProps {
  onFileProcessed?: (result: any) => void
}

export function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingResult, setProcessingResult] = useState<any>(null)
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setUploadError(null)
      setIsUploading(true)
      
      // Upload file to a temporary location
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
        
        const response = await fetch('/api/upload-csv', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const result = await response.json()
          setUploadUrl(result.url)
          setUploadError(null)
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
          setUploadError(errorData.error || `Upload failed: ${response.statusText}`)
          setUploadedFile(null)
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          setUploadError('Upload timed out. Please try again with a smaller file.')
        } else {
          setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.')
        }
        setUploadedFile(null)
      } finally {
        setIsUploading(false)
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

  const handleProcessFile = async () => {
    if (!uploadUrl) return
    
    setIsProcessing(true)
    setUploadError(null)
    
    try {
      const execution = await triggerWakandaWorkflow({
        dataSourceUrl: uploadUrl,
        recipientEmail: 'executive@company.com',
        decisionThreshold: 75
      })
      
      setProcessingResult(execution)
      onFileProcessed?.(execution)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Processing failed. Please try again.'
      setUploadError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadUrl(null)
    setProcessingResult(null)
    setUploadError(null)
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Upload Dataset
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drop your CSV file to analyze with AI
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Display */}
        {uploadError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800 dark:text-red-400">
                Upload Error
              </span>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {uploadError}
            </p>
          </div>
        )}

        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isUploading ? (
              <div className="space-y-2">
                <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-purple-600 dark:text-purple-400 font-medium">
                  Uploading file...
                </p>
              </div>
            ) : isDragActive ? (
              <p className="text-purple-600 dark:text-purple-400 font-medium">
                Drop your CSV file here...
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  Drag & drop your CSV file here, or click to select
                </p>
                <p className="text-xs text-gray-500">
                  Supports CSV files up to 10MB
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Actions */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Ready to Process
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>

            {/* CSV Preview Component */}
            <CSVPreview 
              file={uploadedFile} 
              onProcess={(result) => {
                setProcessingResult(result)
                onFileProcessed?.(result)
              }}
            />

            {/* Processing Result */}
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}