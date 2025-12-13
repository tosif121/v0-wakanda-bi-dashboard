// app/api/kestra/debug/route.ts

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const kestraUrl = process.env.KESTRA_URL || 'http://localhost:8080'
    const username = process.env.KESTRA_USERNAME
    const password = process.env.KESTRA_PASSWORD
    const auth = Buffer.from(`${username}:${password}`).toString('base64')

    // Test various Kestra API endpoints to discover the correct paths
    const testEndpoints = [
      // Standard Kestra API v1 paths
      '/api/v1/health',
      '/api/v1/executions',
      '/api/v1/flows',
      '/api/v1/namespaces',
      
      // Alternative API paths
      '/api/health',
      '/api/executions',
      '/api/flows',
      
      // Root and info endpoints
      '/',
      '/info',
      '/version',
      '/status',
      
      // Swagger/OpenAPI docs
      '/swagger-ui',
      '/api-docs',
      '/docs',
      
      // Specific namespace paths
      `/api/v1/namespaces/${process.env.KESTRA_NAMESPACE}`,
      `/api/v1/namespaces/${process.env.KESTRA_NAMESPACE}/flows`,
      `/api/v1/flows/${process.env.KESTRA_NAMESPACE}`,
    ]

    const results = []

    for (const endpoint of testEndpoints) {
      try {
        const fullUrl = `${kestraUrl}${endpoint}`
        console.log(`Testing: ${fullUrl}`)
        
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`,
          },
          timeout: 3000
        })

        let responseData = null
        let contentType = response.headers.get('content-type')
        
        try {
          const text = await response.text()
          if (contentType?.includes('application/json') && text) {
            responseData = JSON.parse(text)
          } else {
            responseData = text.substring(0, 200) // First 200 chars
          }
        } catch (e) {
          responseData = 'Could not parse response'
        }

        results.push({
          endpoint,
          fullUrl,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          contentType,
          data: responseData
        })

      } catch (error) {
        results.push({
          endpoint,
          fullUrl: `${kestraUrl}${endpoint}`,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      kestraUrl,
      namespace: process.env.KESTRA_NAMESPACE,
      flowId: process.env.KESTRA_FLOW_ID,
      authConfigured: !!(username && password),
      results: results.filter(r => r.ok || r.status < 500) // Show successful and client errors, hide server errors
    })
    
  } catch (error) {
    console.error('Kestra debug failed:', error)
    return NextResponse.json({
      error: error.message
    })
  }
}