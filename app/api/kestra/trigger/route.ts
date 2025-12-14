// app/api/kestra/trigger/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const kestraUrl = process.env.KESTRA_URL || 'http://localhost:8080'
    const namespace = process.env.KESTRA_NAMESPACE || 'assemblehack25.wakanda'
    const flowId = process.env.KESTRA_FLOW_ID || 'wakanda_business_intelligence_engine'
    
    // Validate required data
    if (!body.dataSourceUrl) {
      return NextResponse.json(
        { error: 'dataSourceUrl is required - no default data allowed' },
        { status: 400 }
      )
    }

    const payload = {
      inputs: {
        data_source_url: body.dataSourceUrl,
        recipient_email: body.recipientEmail || 'user@company.com',
        decision_threshold: body.decisionThreshold || 75
      }
    }

    // Check if Kestra is available first
    const healthResponse = await fetch(`${kestraUrl}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    }).catch(() => null)

    if (!healthResponse || !healthResponse.ok) {
      return NextResponse.json(
        { error: 'Kestra server is not available. Please ensure Kestra is running.' },
        { status: 503 }
      )
    }

    // Prepare authentication if available
    const username = process.env.KESTRA_USERNAME
    const password = process.env.KESTRA_PASSWORD
    const auth = (username && password) ? Buffer.from(`${username}:${password}`).toString('base64') : null

    // Kestra expects multipart/form-data
    const formData = new FormData()
    
    // Add each input separately
    Object.entries(payload.inputs).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    const headers = {
      'Accept': 'application/json',
      ...(auth && { 'Authorization': `Basic ${auth}` })
    }

    const response = await fetch(
      `${kestraUrl}/api/v1/executions/${namespace}/${flowId}`,
      {
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Kestra error:', errorText)
      return NextResponse.json(
        { error: `Kestra error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const execution = await response.json()
    return NextResponse.json(execution)
    
  } catch (error) {
    console.error('Error triggering workflow:', error)
    return NextResponse.json(
      { error: 'Failed to trigger workflow' },
      { status: 500 }
    )
  }
}
