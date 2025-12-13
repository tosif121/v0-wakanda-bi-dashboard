// app/api/kestra/trigger/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const kestraUrl = process.env.KESTRA_URL || 'http://localhost:8080'
    const namespace = process.env.KESTRA_NAMESPACE || 'assemblehack25.wakanda'
    const flowId = process.env.KESTRA_FLOW_ID || 'wakanda_business_intelligence_engine'
    
    const payload = {
      inputs: {
        data_source_url: body.dataSourceUrl || 'https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv',
        recipient_email: body.recipientEmail || 'executive@company.com',
        decision_threshold: body.decisionThreshold || 75
      }
    }

    // Basic Authentication
    const username = process.env.KESTRA_USERNAME
    const password = process.env.KESTRA_PASSWORD
    const auth = Buffer.from(`${username}:${password}`).toString('base64')



    // Kestra expects multipart/form-data
    const formData = new FormData()
    formData.append('inputs', JSON.stringify(payload.inputs))

    const response = await fetch(
      `${kestraUrl}/api/v1/main/executions/${namespace}/${flowId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
        body: formData
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
