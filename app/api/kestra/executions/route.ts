// app/api/kestra/executions/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '10'
    
    const kestraUrl = process.env.KESTRA_URL || 'http://localhost:8080'
    const namespace = process.env.KESTRA_NAMESPACE || 'assemblehack25.wakanda'
    const flowId = process.env.KESTRA_FLOW_ID || 'wakanda_business_intelligence_engine'
    
    // Check if Kestra is available first
    const healthResponse = await fetch(`${kestraUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    }).catch(() => null)

    if (!healthResponse || !healthResponse.ok) {
      // Kestra is not available, return empty array
      return NextResponse.json({
        results: [],
        total: 0,
        message: 'Kestra server is not available'
      })
    }

    // Try without authentication first (local deployment)
    let response = await fetch(
      `${kestraUrl}/api/v1/executions/search?namespace=${namespace}&flowId=${flowId}&size=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    ).catch(() => null)

    // If that fails, try with authentication (secured deployment)
    if (!response || !response.ok) {
      const username = process.env.KESTRA_USERNAME
      const password = process.env.KESTRA_PASSWORD
      
      if (username && password) {
        const auth = Buffer.from(`${username}:${password}`).toString('base64')
        response = await fetch(
          `${kestraUrl}/api/v1/executions/search?namespace=${namespace}&flowId=${flowId}&size=${limit}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${auth}`,
            },
            signal: AbortSignal.timeout(10000)
          }
        ).catch(() => null)
      }
    }

    if (!response || !response.ok) {
      // Return empty results instead of error
      return NextResponse.json({
        results: [],
        total: 0,
        message: 'No executions found or Kestra unavailable'
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error listing executions:', error)
    return NextResponse.json(
      { error: 'Failed to list executions' },
      { status: 500 }
    )
  }
}