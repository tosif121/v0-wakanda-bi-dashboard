import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || '1.0.0',
      services: {
        database: 'unknown', // Will be updated when we add actual health checks
        storage: 'unknown',
        ai: 'unknown'
      }
    }

    // Check environment variables (without exposing values)
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    if (missingEnvVars.length > 0) {
      healthStatus.services.database = 'misconfigured'
    } else {
      healthStatus.services.database = 'configured'
    }

    // Check storage configuration
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      healthStatus.services.storage = 'vercel-blob'
    } else {
      healthStatus.services.storage = 'local-fallback'
    }

    // Check AI configuration
    if (process.env.PERPLEXITY_API_KEY) {
      healthStatus.services.ai = 'configured'
    } else {
      healthStatus.services.ai = 'not-configured'
    }

    return NextResponse.json(healthStatus, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}