import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const kestraUrl = process.env.KESTRA_URL || 'http://localhost:8080'
    const username = process.env.KESTRA_USERNAME
    const password = process.env.KESTRA_PASSWORD
    
    if (!username || !password) {
      return NextResponse.json({
        kestra: {
          url: kestraUrl,
          healthy: false,
          error: 'Missing Kestra credentials (KESTRA_USERNAME or KESTRA_PASSWORD)'
        },
        environment: {
          namespace: process.env.KESTRA_NAMESPACE,
          flowId: process.env.KESTRA_FLOW_ID
        }
      })
    }

    // Basic Authentication
    const auth = Buffer.from(`${username}:${password}`).toString('base64')

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
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`,
          },
          timeout: 5000
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
      } catch (error) {
        lastError = error
        responseDetails.push({
          endpoint,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      kestra: {
        url: kestraUrl,
        healthy: false,
        error: lastError?.message || 'All endpoints failed',
        auth: username ? 'Credentials configured' : 'No credentials'
      },
      environment: {
        namespace: process.env.KESTRA_NAMESPACE,
        flowId: process.env.KESTRA_FLOW_ID
      },
      debug: {
        testedEndpoints: responseDetails,
        lastError: lastError?.message
      }
    })
    
  } catch (error) {
    console.error('Kestra health check failed:', error)
    return NextResponse.json({
      kestra: {
        url: process.env.KESTRA_URL || 'http://localhost:8080',
        healthy: false,
        error: error.message
      },
      environment: {
        namespace: process.env.KESTRA_NAMESPACE,
        flowId: process.env.KESTRA_FLOW_ID
      }
    })
  }
}