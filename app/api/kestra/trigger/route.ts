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
        { 
          error: 'Kestra server is not available. Please ensure Kestra is running at http://localhost:8080',
          suggestion: 'Start Kestra with: docker run --pull=always --rm -it -p 8080:8080 --user=root -v /var/run/docker.sock:/var/run/docker.sock -v /tmp:/tmp kestra/kestra:latest server local'
        },
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
      
      let errorMessage = `Kestra error: ${response.statusText}`
      
      // Provide specific error messages based on status
      if (response.status === 401) {
        errorMessage = 'Authentication failed. Please check Kestra credentials.'
      } else if (response.status === 404) {
        errorMessage = 'Workflow not found. Please ensure the workflow is deployed in Kestra.'
      } else if (response.status === 400) {
        errorMessage = 'Invalid workflow parameters. Please check your data source URL.'
      } else if (response.status >= 500) {
        errorMessage = 'Kestra server error. Please try again later.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: process.env.NEXT_PUBLIC_SHOW_ERROR_DETAILS === 'true' ? errorText : undefined,
          status: response.status
        },
        { status: response.status }
      )
    }

    const execution = await response.json()
    return NextResponse.json(execution)
    
  } catch (error: unknown) {
    console.error('Error triggering workflow:', error)
    
    let errorMessage = 'Failed to trigger workflow'
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Kestra may be slow to respond.'
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to Kestra. Please ensure it is running.'
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error connecting to Kestra.'
      } else {
        errorMessage = `Workflow trigger failed: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NEXT_PUBLIC_SHOW_ERROR_DETAILS === 'true' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
