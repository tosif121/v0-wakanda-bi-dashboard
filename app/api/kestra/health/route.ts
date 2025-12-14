import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const kestraUrl = process.env.KESTRA_URL || 'http://localhost:8080'
    const username = process.env.KESTRA_USERNAME
    const password = process.env.KESTRA_PASSWORD
    
    // Prepare authentication if available
    const auth = (username && password) ? Buffer.from(`${username}:${password}`).toString('base64') : null

    // Try multiple health endpoints
    const endpoints = [
      `${kestraUrl}/api/v1/main/health`,
      `${kestraUrl}/api/v1/health`,
      `${kestraUrl}/health`,
      `${kestraUrl}/api/health`,
      `${kestraUrl}/`
    ]

    let lastError = null
    let responseDetails = []

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing Kestra endpoint: ${endpoint}`)
        
        const headers = {
          'Content-Type': 'application/json',
          ...(auth && { 'Authorization': `Basic ${auth}` })
        }

        const response = await fetch(endpoint, {
          method: 'GET',
          headers,
          signal: AbortSignal.timeout(5000)
        })

        responseDetails.push({
          endpoint,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })

        if (response.ok) {
          let healthData = null
          try {
            const text = await response.text()
            healthData = text ? JSON.parse(text) : { status: 'ok' }
          } catch {
            healthData = { status: 'ok', raw: true }
          }

          return NextResponse.json({
            kestra: {
              url: kestraUrl,
              healthy: true,
              status: response.status,
              data: healthData,
              endpoint: endpoint,
              auth: 'Basic Auth configured'
            },
            environment: {
              namespace: process.env.KESTRA_NAMESPACE,
              flowId: process.env.KESTRA_FLOW_ID
            },
            debug: {
              testedEndpoints: responseDetails
            }
          })
        }
      } catch (error: unknown) {
        lastError = error
        responseDetails.push({
          endpoint,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      kestra: {
        url: kestraUrl,
        healthy: false,
        error: (lastError instanceof Error ? lastError.message : 'All endpoints failed'),
        auth: username ? 'Credentials configured' : 'No credentials',
        status: 'offline'
      },
      environment: {
        namespace: process.env.KESTRA_NAMESPACE,
        flowId: process.env.KESTRA_FLOW_ID
      },
      debug: {
        testedEndpoints: responseDetails,
        lastError: lastError instanceof Error ? lastError.message : 'Unknown error'
      }
    })
    
  } catch (error: unknown) {
    console.error('Kestra health check failed:', error)
    return NextResponse.json({
      kestra: {
        url: process.env.KESTRA_URL || 'http://localhost:8080',
        healthy: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        status: 'offline'
      },
      environment: {
        namespace: process.env.KESTRA_NAMESPACE,
        flowId: process.env.KESTRA_FLOW_ID
      }
    })
  }
}