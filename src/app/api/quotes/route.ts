import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'

type QuoteInsert = Database['public']['Tables']['quotes']['Insert']

export async function GET(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Fetching quotes for user:', userId)
    
    // RLS가 적용된 클라이언트로 사용자 소유 견적서만 조회
    const supabase = createUserSupabaseClient(request)
    
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching quotes:', error)
      return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
    }

    return NextResponse.json(quotes || [])
  } catch (error) {
    console.error('Error in GET /api/quotes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API Route: POST /api/quotes called')
    
    const supabase = createServerSupabaseClient()
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

    // Supabase Auth를 사용해서 임시 사용자 생성
    console.log('Creating temporary user via Supabase Auth...')
    
    const randomId = Math.random().toString(36).substring(2, 15)
    const tempUserEmail = `temp-${randomId}@example.com`
    const tempPassword = 'TempPassword123!'

    // 1. Auth 사용자 생성
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: tempUserEmail,
      password: tempPassword,
      email_confirm: true, // 이메일 확인 건너뛰기
    })

    if (authError) {
      console.error('Failed to create auth user:', authError)
      return NextResponse.json({ 
        error: 'Failed to create auth user', 
        details: authError.message 
      }, { status: 500 })
    }

    console.log('Auth user created:', authUser.user?.id)

    // 2. Public users 테이블에 추가 정보 저장
    const { data: publicUser, error: publicUserError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: tempUserEmail,
        name: 'Temp User',
        role: 'freelancer'
      })
      .select()
      .single()

    if (publicUserError) {
      console.error('Failed to create public user:', publicUserError)
      return NextResponse.json({ 
        error: 'Failed to create public user', 
        details: publicUserError.message,
        code: publicUserError.code 
      }, { status: 500 })
    }

    console.log('Public user created:', publicUser)

    // 3. 공급자 정보로 사용자 프로필 업데이트 (필요시)
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
        .eq('id', authUser.user.id)

      if (updateError) {
        console.warn('Failed to update user profile:', updateError)
        // 사용자 프로필 업데이트 실패는 치명적이지 않으므로 계속 진행
      }
    }

    // 4. 견적서 생성
    const expiresAt = body.valid_until ? new Date(body.valid_until).toISOString() : (body.expires_at ? new Date(body.expires_at).toISOString() : null)
    
    const quoteData: any = {
      user_id: authUser.user.id,
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone || null,
      client_company: body.client_company || null,
      title: body.title,
      description: body.description || null,
      items: items,
      subtotal: subtotal,
      status: body.status || 'draft',
      expires_at: expiresAt,
      client_business_number: body.client_business_number || null,
      client_address: body.client_address || null,
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
