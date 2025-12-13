import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test basic connection
    const { data: executions, error: execError } = await supabase
      .from('executions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: insights, error: insightsError } = await supabase
      .from('ai_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)

    const { data: decisions, error: decisionsError } = await supabase
      .from('decisions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)

    return NextResponse.json({
      success: true,
      data: {
        executions: {
          count: executions?.length || 0,
          data: executions,
          error: execError?.message
        },
        insights: {
          count: insights?.length || 0,
          data: insights,
          error: insightsError?.message
        },
        decisions: {
          count: decisions?.length || 0,
          data: decisions,
          error: decisionsError?.message
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// Test endpoint to manually insert data (for debugging)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Insert test execution
    const { data: execution, error: execError } = await supabase
      .from('executions')
      .insert({
        id: body.executionId || 'test-' + Date.now(),
        status: 'success',
        start_time: new Date().toISOString(),
        duration: '47s',
        dataset_name: 'titanic.csv',
        dataset_rows: 891,
        impact_score: 87,
        confidence: 94.2
      })
      .select()
      .single()

    if (execError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to insert execution: ' + execError.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Test data inserted successfully',
      data: execution
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}