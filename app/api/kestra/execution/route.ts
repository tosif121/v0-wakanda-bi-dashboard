// app/api/kestra/executions/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || '10'
    
    const kestraUrl = process.env.KESTRA_URL || 'http://localhost:8080'
    
    const response = await fetch(
      `${kestraUrl}/api/v1/executions?size=${limit}&sort=startDate:desc`,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch executions' },
        { status: response.status }
      )
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
