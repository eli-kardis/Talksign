import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

// 서버 사이드에서 사용할 Supabase 클라이언트 생성
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseServiceKey) {
    throw new Error('Missing Supabase service role key')
  }

  const client = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return client
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    
    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    
    // 특정 견적서 조회 (공급자 정보 포함)
    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        *,
        supplier:user_id (
          name,
          email,
          phone,
          business_name,
          business_registration_number,
          company_name,
          business_address
        )
      `)
      .eq('id', quoteId)
      .single()

    if (error) {
      console.error('Error fetching quote:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
    }

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}