// app/api/kestra/executions/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '10'
    
    const kestraUrl = process.env.KESTRA_URL || 'http://localhost:8080'
    const namespace = process.env.KESTRA_NAMESPACE || 'assemblehack25.wakanda'
    const flowId = process.env.KESTRA_FLOW_ID || 'wakanda_business_intelligence_engine'
    
    // Prepare authentication
    const username = process.env.KESTRA_USERNAME
    const password = process.env.KESTRA_PASSWORD
    const auth = (username && password) ? Buffer.from(`${username}:${password}`).toString('base64') : null

    const headers = {
      'Content-Type': 'application/json',
      ...(auth && { 'Authorization': `Basic ${auth}` })
    }

    const response = await fetch(
      `${kestraUrl}/api/v1/executions/search?namespace=${namespace}&flowId=${flowId}&size=${limit}`,
      {
        headers,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }
    )

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