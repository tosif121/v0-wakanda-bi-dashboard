'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { checkKestraHealth } from './kestra'

interface KestraConnectionState {
  isConnected: boolean
  isChecking: boolean
  lastChecked: Date | null
  error: string | null
  retryCount: number
}

const RETRY_INTERVALS = [5000, 10000, 30000, 60000] // Progressive backoff: 5s, 10s, 30s, 1m
const MAX_RETRIES = 4

export function useKestraConnection() {
  const [state, setState] = useState<KestraConnectionState>({
    isConnected: false,
    isChecking: false,
    lastChecked: null,
    error: null,
    retryCount: 0
  })
  
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const checkConnection = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (state.isChecking) {
      return state.isConnected
    }
    
    setState(prev => ({ ...prev, isChecking: true }))
    
    try {
      const health = await checkKestraHealth()
      const isHealthy = health.kestra.healthy
      
      setState(prev => ({
        ...prev,
        isConnected: isHealthy,
        isChecking: false,
        lastChecked: new Date(),
        error: isHealthy ? null : (health.kestra.error || 'Connection failed'),
        retryCount: isHealthy ? 0 : prev.retryCount
      }))
      
      return isHealthy
    } catch (error: unknown) {
      let errorMessage = 'Connection failed'
      
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Kestra server not running'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Connection timeout'
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error'
        } else {
          errorMessage = error.message
        }
      }
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        isChecking: false,
        lastChecked: new Date(),
        error: errorMessage,
        retryCount: prev.retryCount
      }))
      
      return false
    }
  }, [state.isChecking, state.isConnected])

  // Auto-retry when disconnected
  useEffect(() => {
    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    // Schedule retry if disconnected and not checking and haven't exceeded max retries
    if (!state.isConnected && !state.isChecking && state.retryCount < MAX_RETRIES && state.lastChecked !== null) {
      const newRetryCount = state.retryCount + 1
      const retryInterval = RETRY_INTERVALS[newRetryCount - 1] || RETRY_INTERVALS[RETRY_INTERVALS.length - 1]
      
      // Update retry count first
      setState(prev => ({
        ...prev,
        retryCount: newRetryCount
      }))
      
      // Schedule the retry
      retryTimeoutRef.current = setTimeout(() => {
        checkConnection()
      }, retryInterval)
    }

    // Cleanup timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [state.isConnected, state.isChecking, state.retryCount, state.lastChecked, checkConnection])

  // Initial connection check
  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  return {
    ...state,
    checkConnection,
    canMakeApiCalls: state.isConnected,
    shouldShowOfflineMessage: !state.isConnected && state.lastChecked !== null
  }
}