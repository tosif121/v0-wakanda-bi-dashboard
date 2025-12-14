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
  const isMountedRef = useRef(true)

  const checkConnection = useCallback(async () => {
    // Check if component is still mounted
    if (!isMountedRef.current) {
      return false
    }
    
    setState(prev => {
      // Prevent multiple simultaneous checks
      if (prev.isChecking) {
        return prev
      }
      return { ...prev, isChecking: true }
    })
    
    try {
      const health = await checkKestraHealth()
      const isHealthy = health.kestra.healthy
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isConnected: isHealthy,
          isChecking: false,
          lastChecked: new Date(),
          error: isHealthy ? null : (health.kestra.error || 'Connection failed'),
          retryCount: isHealthy ? 0 : prev.retryCount
        }))
      }
      
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
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isChecking: false,
          lastChecked: new Date(),
          error: errorMessage,
          retryCount: prev.retryCount
        }))
      }
      
      return false
    }
  }, []) // Remove dependencies to prevent infinite re-creation

  // Auto-retry when disconnected
  useEffect(() => {
    // Don't run if component is unmounted
    if (!isMountedRef.current) {
      return
    }

    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    // Only schedule retry if we've checked at least once and are disconnected
    if (!state.isConnected && !state.isChecking && state.retryCount < MAX_RETRIES && state.lastChecked !== null) {
      const newRetryCount = state.retryCount + 1
      const retryInterval = RETRY_INTERVALS[newRetryCount - 1] || RETRY_INTERVALS[RETRY_INTERVALS.length - 1]
      
      console.log(`Scheduling Kestra retry ${newRetryCount}/${MAX_RETRIES} in ${retryInterval}ms`)
      
      // Schedule the retry
      retryTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setState(prev => ({ ...prev, retryCount: newRetryCount }))
          checkConnection()
        }
      }, retryInterval)
    }

    // Cleanup timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [state.isConnected, state.isChecking, state.retryCount, state.lastChecked]) // Remove checkConnection from deps

  // Initial connection check (only once)
  useEffect(() => {
    console.log('Kestra connection hook: Initial check')
    checkConnection()
  }, []) // Empty dependency array for initial check only

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
    }
  }, [])

  return {
    ...state,
    checkConnection,
    canMakeApiCalls: state.isConnected,
    shouldShowOfflineMessage: !state.isConnected && state.lastChecked !== null
  }
}