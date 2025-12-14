import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id

    if (!executionId || executionId.trim() === '') {
      return NextResponse.json(
        { error: 'Execution ID is required' },
        { status: 400 }
      )
    }

    // Delete from executions table
    const { error: executionError } = await supabase
      .from('executions')
      .delete()
      .eq('id', executionId)

    if (executionError) {
      return NextResponse.json(
        { error: 'Failed to delete execution' },
        { status: 500 }
      )
    }

    // Delete related AI insights
    await supabase
      .from('ai_insights')
      .delete()
      .eq('execution_id', executionId)

    // Delete related decisions
    await supabase
      .from('decisions')
      .delete()
      .eq('execution_id', executionId)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Execution deleted successfully'
      },
      { status: 200 }
    )

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const executionId = params.id

    if (!executionId || executionId.trim() === '') {
      return NextResponse.json(
        { error: 'Execution ID is required' },
        { status: 400 }
      )
    }

    // Get execution with related data
    const { data: execution, error: executionError } = await supabase
      .from('executions')
      .select(`
        *,
        ai_insights (*),
        decisions (*)
      `)
      .eq('id', executionId)
      .single()

    if (executionError) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(execution, { status: 200 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}