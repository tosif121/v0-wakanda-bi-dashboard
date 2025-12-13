'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Play, Download, GitBranch, X } from 'lucide-react'
import { triggerWakandaWorkflow } from '@/lib/kestra'

export function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false)
  const [isTriggering, setIsTriggering] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTriggerWorkflow = async () => {
    setIsTriggering(true)
    try {
      await triggerWakandaWorkflow()
    } catch (error) {
      console.error('Failed to trigger workflow:', error)
    } finally {
      setIsTriggering(false)
      setIsOpen(false)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
    setIsOpen(false)
  }

  const actions = [

    {
      icon: Play,
      label: 'Run Analysis',
      onClick: handleTriggerWorkflow,
      disabled: isTriggering,
      className: 'bg-linear-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white'
    },
    {
      icon: GitBranch,
      label: 'View Workflow',
      onClick: () => window.open('http://localhost:8080', '_blank'),
      className: 'bg-blue-500 hover:bg-blue-600 text-white'
    },
    {
      icon: Download,
      label: 'Download Report',
      onClick: () => {
        // Generate and download a simple report
        const reportData = {
          timestamp: new Date().toISOString(),
          dashboard: 'Wakanda BI Engine',
          status: 'Active',
          message: 'Report generation feature coming soon!'
        }
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `wakanda-bi-report-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      },
      className: 'bg-emerald-500 hover:bg-emerald-600 text-white'
    }
  ]

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            // Scroll to file upload section
            const uploadSection = document.querySelector('[data-upload-section]')
            uploadSection?.scrollIntoView({ behavior: 'smooth' })
          }
        }}
      />
      {/* Action Buttons */}
      <div className={`space-y-3 mb-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {actions.map((action, index) => (
          <div
            key={action.label}
            className="flex items-center gap-3"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              {action.label}
            </span>
            <Button
              onClick={action.onClick}
              disabled={action.disabled}
              className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 ${action.className}`}
            >
              {action.disabled && action.label === 'Run Analysis' ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <action.icon className="h-5 w-5" />
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-linear-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700'
        } text-white`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  )
}