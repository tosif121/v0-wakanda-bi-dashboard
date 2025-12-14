'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useKestraConnection } from './use-kestra-connection'

interface KestraConnectionContextType {
  isConnected: boolean
  isChecking: boolean
  lastChecked: Date | null
  error: string | null
  retryCount: number
  checkConnection: () => Promise<boolean>
  canMakeApiCalls: boolean
  shouldShowOfflineMessage: boolean
}

const KestraConnectionContext = createContext<KestraConnectionContextType | null>(null)

interface KestraConnectionProviderProps {
  children: ReactNode
}

export function KestraConnectionProvider({ children }: KestraConnectionProviderProps) {
  const connection = useKestraConnection()
  
  return (
    <KestraConnectionContext.Provider value={connection}>
      {children}
    </KestraConnectionContext.Provider>
  )
}

export function useKestraConnectionContext() {
  const context = useContext(KestraConnectionContext)
  if (!context) {
    throw new Error('useKestraConnectionContext must be used within a KestraConnectionProvider')
  }
  return context
}