// app/api/kestra/execution/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const kestraUrl = process.env.KESTRA_URL || 'http://localhost:8080'
    
    // Basic Authentication
    const username = process.env.KESTRA_USERNAME
    const password = process.env.KESTRA_PASSWORD
    const auth = Buffer.from(`${username}:${password}`).toString('base64')

    const response = await fetch(
      `${kestraUrl}/api/v1/main/executions/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        }
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: response.status }
      )
    }

    const execution = await response.json()
    return NextResponse.json(execution)
    
  } catch (error) {
    console.error('Error getting execution:', error)
    return NextResponse.json(
      { error: 'Failed to get execution' },
      { status: 500 }
    )
  }
}
