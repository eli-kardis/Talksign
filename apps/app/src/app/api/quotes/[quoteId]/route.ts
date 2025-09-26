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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    
    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 })
    }

    const body = await request.json()
    console.log('API Route: PUT /api/quotes/[quoteId] called')
    console.log('Request body:', body)

    const supabase = createServerSupabaseClient()
    
    // 견적서 아이템들의 subtotal 계산
    const subtotal = body.items?.reduce((sum: number, item: any) => {
      return sum + (item.unit_price * item.quantity)
    }, 0) || 0

    console.log('Calculated subtotal:', subtotal)

    // expires_at 처리
    const expiresAt = body.valid_until ? new Date(body.valid_until).toISOString() : (body.expires_at ? new Date(body.expires_at).toISOString() : null)

    // 견적서 업데이트 데이터 준비
    const quoteData = {
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone,
      client_company: body.client_company,
      title: body.title,
      description: body.description,
      items: body.items,
      subtotal: subtotal,
      status: body.status || 'draft',
      expires_at: expiresAt,
      client_business_number: body.client_business_number || null,
      client_address: body.client_address || null,
      updated_at: new Date().toISOString()
    }

    console.log('Quote data to update:', quoteData)

    // 견적서 업데이트
    const { data: quote, error } = await supabase
      .from('quotes')
      .update(quoteData)
      .eq('id', quoteId)
      .select()
      .single()

    if (error) {
      console.error('Error updating quote:', error)
      return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
    }

    console.log('Quote updated successfully:', quote)

    return NextResponse.json(quote, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;
    
    if (!quoteId) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 })
    }

    console.log('API Route: DELETE /api/quotes/[quoteId] called')
    console.log('Quote ID:', quoteId)

    const supabase = createServerSupabaseClient()
    
    // 견적서 삭제
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', quoteId)

    if (error) {
      console.error('Error deleting quote:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 })
    }

    console.log('Quote deleted successfully:', quoteId)

    return NextResponse.json({ message: 'Quote deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}