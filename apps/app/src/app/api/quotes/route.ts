import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logCreate, extractMetadata } from '@/lib/audit-log'
import type { Database } from '@/lib/database.types'

type QuoteInsert = Database['public']['Tables']['quotes']['Insert']

export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/quotes called')
    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting 체크
    const rateLimitError = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
    if (rateLimitError) {
      return rateLimitError
    }

    console.log('Fetching quotes for user:', userId)

    // 환경에 맞는 Supabase 클라이언트 생성
    const supabase = createSupabaseClient(request)

    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching quotes:', error)
      // Supabase 에러 시 빈 배열 반환 (RLS 정책으로 인한 접근 제한일 수 있음)
      console.log('Returning empty array due to database error')
      return NextResponse.json([])
    }

    console.log('Raw quotes from database:', JSON.stringify(quotes, null, 2))
    console.log('Number of quotes found:', quotes?.length || 0)

    // 견적서가 없으면 빈 배열 반환 (정상적인 상황)
    return NextResponse.json(quotes || [])
  } catch (error) {
    console.error('Error in GET /api/quotes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API Route: POST /api/quotes called')

    // 사용자 인증 확인 - 개발 환경에서는 현재 사용자 사용
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting 체크
    const rateLimitError = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
    if (rateLimitError) {
      return rateLimitError
    }

    console.log('Creating quote for user:', userId)

    // 환경에 맞는 Supabase 클라이언트 생성
    const supabase = createSupabaseClient(request)
    console.log('Supabase client created')
    
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    // 필수 필드 검증
    if (!body.client_name || !body.client_email || !body.title) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: client_name, client_email, title' },
        { status: 400 }
      )
    }

    // 견적서 항목 총합 계산
    const items = body.items || []
    const subtotal = items.reduce((sum: number, item: { amount?: number }) => sum + (item.amount || 0), 0)
    console.log('Calculated subtotal:', subtotal)

    // 공급자 정보로 사용자 프로필 업데이트 (필요시)
    if (body.supplier_info) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: body.supplier_info.name,
          phone: body.supplier_info.phone,
          business_number: body.supplier_info.business_registration_number,
          business_name: body.supplier_info.business_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.warn('Failed to update user profile:', updateError)
        // 사용자 프로필 업데이트 실패는 치명적이지 않으므로 계속 진행
      }
    }

    // 견적서 생성
    const expiresAt = body.valid_until ? new Date(body.valid_until).toISOString() : (body.expires_at ? new Date(body.expires_at).toISOString() : null)
    
    const quoteData: QuoteInsert = {
      user_id: userId,
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone || null,
      client_company: body.client_company || null,
      title: body.title,
      description: body.description || null,
      items: items,
      subtotal: subtotal,
      status: body.status || 'draft',
      expires_at: expiresAt ?? undefined,
      client_business_number: body.client_business_number || undefined,
      client_address: body.client_address || undefined,
    }
    
    console.log('Quote data to insert:', JSON.stringify(quoteData, null, 2))

    const { data: quote, error } = await supabase
      .from('quotes')
      .insert(quoteData)
      .select()
      .single()

    if (error) {
      console.error('Failed to create quote:', error)
      return NextResponse.json({ 
        error: 'Failed to create quote', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    console.log('Quote created successfully:', quote)

    // Audit logging
    await logCreate(userId, 'quote', quote.id, quoteData, extractMetadata(request))

    return NextResponse.json(quote, { status: 201 })
    
  } catch (error) {
    console.error('Unexpected error in POST /api/quotes:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
