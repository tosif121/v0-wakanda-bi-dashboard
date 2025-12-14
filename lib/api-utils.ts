/**
 * API utilities for consistent error handling and timeouts
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Fetch with timeout and consistent error handling
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    return response
  } catch (error: unknown) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timed out. Please try again.', 408)
      }
      
      if (error.message.includes('ECONNREFUSED')) {
        throw new ApiError('Service unavailable. Please check if the server is running.', 503)
      }
      
      if (error.message.includes('fetch')) {
        throw new ApiError('Network error. Please check your connection.', 0)
      }
    }
    
    throw error
  }
}

/**
 * Parse API response with consistent error handling
 */
export async function parseApiResponse<T = any>(response: Response): Promise<ApiResponse<T>> {
  try {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }))
      
      return {
        success: false,
        error: errorData.error || `Request failed: ${response.statusText}`,
        details: errorData.details
      }
    }
    
    const data = await response.json()
    return {
      success: true,
      data
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse response'
    }
  }
}

/**
 * Make API call with consistent error handling
 */
export async function apiCall<T = any>(
  url: string,
  options: RequestInit = {},
  timeoutMs?: number
): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithTimeout(url, options, timeoutMs)
    return await parseApiResponse<T>(response)
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        details: error.details
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (error instanceof ApiError) {
    return error.message
  }
  
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return 'Request timed out. Please try again.'
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      return 'Cannot connect to server. Please ensure it is running.'
    }
    
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your connection.'
    }
    
    return error.message
  }
  
  return 'An unexpected error occurred'
}