import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest, createServerSupabaseClient } from '@/lib/auth-utils'
import type { Database, QuoteItem } from '@/lib/supabase'

type QuoteInsert = Database['public']['Tables']['quotes']['Insert']

// Frontend QuoteItem interface (different from DB QuoteItem)
interface FrontendQuoteItem {
  id: number
  name: string
  description: string
  unit_price: number
  quantity: number
  unit: string
  amount: number
}

interface SupplierInfo {
  name: string
  email: string
  phone: string
  business_registration_number: string | null
  company_name: string | null
  business_name: string | null
}

interface QuoteRequestBody {
  client_name: string
  client_email: string
  client_phone?: string
  client_company?: string
  title: string
  description?: string
  valid_until?: string
  expires_at?: string
  items: FrontendQuoteItem[]
  status?: 'draft' | 'sent'
  supplier_info?: SupplierInfo
  client_business_number?: string
  client_address?: string
  client_logo_url?: string
}

export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/quotes called')
    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Fetching quotes for user:', userId)

    // 사용자별 클라이언트로 견적서 조회 (RLS 적용)
    const supabase = createUserSupabaseClient(request)

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
    
    console.log('Creating quote for user:', userId)

    // 서버 클라이언트로 견적서 생성 (RLS 우회)
    const supabase = createServerSupabaseClient()
    console.log('Supabase server client created')
    
    const body: QuoteRequestBody = await request.json()
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
    const subtotal = items.reduce((sum: number, item: FrontendQuoteItem) => sum + (item.amount || 0), 0)
    console.log('Calculated subtotal:', subtotal)

    // 공급자 정보로 사용자 프로필 업데이트 (필요시)
    if (body.supplier_info) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: body.supplier_info.name,
          phone: body.supplier_info.phone,
          business_registration_number: body.supplier_info.business_registration_number,
          company_name: body.supplier_info.company_name,
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
    
    // Convert frontend items to DB format
    const dbItems: QuoteItem[] = items.map(item => ({
      id: item.id.toString(),
      description: `${item.name}: ${item.description}`,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.amount
    }))

    const quoteData: Partial<QuoteInsert> = {
      user_id: userId,
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone || undefined,
      client_company: body.client_company || undefined,
      title: body.title,
      description: body.description || undefined,
      items: dbItems,
      subtotal: subtotal,
      status: body.status || 'draft',
      expires_at: expiresAt ?? undefined,
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
    return NextResponse.json(quote, { status: 201 })
    
  } catch (error) {
    console.error('Unexpected error in POST /api/quotes:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
