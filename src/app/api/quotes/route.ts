import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'

// 서버 사이드에서 사용할 Supabase 클라이언트 생성
function createServerSupabaseClient(authToken?: string) {
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

  // 사용자 토큰이 있으면 설정
  if (authToken) {
    // 토큰 설정은 생략하고 간단히 진행
    // client.auth.setSession() 은 복잡하므로 차후 구현
  }

  return client
}

type QuoteInsert = Database['public']['Tables']['quotes']['Insert']

export async function GET(request: NextRequest) {
  try {
    // 일단 간단히 모든 데이터 반환 (개발용)
    // TODO: 실제 사용자 인증 구현 필요
    const supabase = createServerSupabaseClient()
    
    // 모든 견적서 조회 (임시)
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
    console.error('Unexpected error:', error)
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
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
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

    // 3. 견적서 생성
    const quoteData: QuoteInsert = {
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
      expires_at: body.expires_at || null,
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
