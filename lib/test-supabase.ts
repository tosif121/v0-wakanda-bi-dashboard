// Test script to verify Supabase connection and data
import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('executions')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Check for recent executions
    const { data: executions, error: execError } = await supabase
      .from('executions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (execError) {
      console.error('❌ Error fetching executions:', execError)
      return false
    }
    
    console.log(`📊 Found ${executions?.length || 0} executions`)
    if (executions && executions.length > 0) {
      console.log('Latest execution:', executions[0])
    }
    
    // Check for AI insights
    const { data: insights, error: insightsError } = await supabase
      .from('ai_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (!insightsError && insights) {
      console.log(`🧠 Found ${insights.length} AI insights`)
    }
    
    // Check for decisions
    const { data: decisions, error: decisionsError } = await supabase
      .from('decisions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (!decisionsError && decisions) {
      console.log(`⚡ Found ${decisions.length} decisions`)
    }
    
    return true
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return false
  }
}

// Run the test
if (typeof window === 'undefined') {
  testSupabaseConnection()
}