'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 blur-md opacity-50"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
              <span className="text-2xl font-bold text-white drop-shadow-lg">W</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p>Wakanda BI Engine - AI-Powered Business Intelligence</p>
        </div>
      </div>
    </div>
  )
}
