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

// Mock 데이터 (개발용)
const mockCustomers = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    company_name: '(주)스타트업에이',
    representative_name: '김사장',
    contact_person: '이담당',
    email: 'contact@startup-a.com',
    phone: '02-1234-5678',
    address: '서울시 강남구 테헤란로 123, 스타트업타워 5층',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    company_name: '테크솔루션즈',
    representative_name: '박대표',
    contact_person: '최매니저',
    email: 'info@techsolutions.com',
    phone: '02-9876-5432',
    address: '서울시 서초구 강남대로 456, 테크빌딩 10층',
    created_at: '2024-02-01T10:30:00Z',
    updated_at: '2024-02-01T10:30:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    company_name: '디자인스튜디오',
    representative_name: '정실장',
    contact_person: null,
    email: 'hello@designstudio.co.kr',
    phone: '010-1111-2222',
    address: '서울시 마포구 홍대입구로 789, 크리에이티브센터 3층',
    created_at: '2024-02-10T14:15:00Z',
    updated_at: '2024-02-10T14:15:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    company_name: '글로벌인더스트리',
    representative_name: '송회장',
    contact_person: '윤과장',
    email: 'business@global-industry.com',
    phone: '02-5555-6666',
    address: '부산시 해운대구 센텀중앙로 100, 글로벌타워 20층',
    created_at: '2024-02-15T16:45:00Z',
    updated_at: '2024-02-15T16:45:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    company_name: '스마트솔루션',
    representative_name: '한이사',
    contact_person: '신차장',
    email: 'contact@smart-sol.kr',
    phone: '031-7777-8888',
    address: '경기도 성남시 분당구 판교로 200, 스마트빌딩 7층',
    created_at: '2024-02-20T11:20:00Z',
    updated_at: '2024-02-20T11:20:00Z'
  }
]

export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/customers called')
    
    // Mock 데이터 반환 (실제 구현에서는 Supabase에서 데이터를 가져옴)
    const customers = mockCustomers.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    console.log('Fetched customers:', customers.length)
    
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('API Route: POST /api/customers called')
    console.log('Request body:', body)

    // 입력값 검증
    const requiredFields = ['company_name', 'representative_name', 'email', 'phone']
    const missingFields = requiredFields.filter(field => !body[field]?.trim())
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // 새 고객 데이터 생성
    const newCustomer = {
      id: `550e8400-e29b-41d4-a716-${Date.now()}`,
      company_name: body.company_name.trim(),
      representative_name: body.representative_name.trim(),
      contact_person: body.contact_person?.trim() || null,
      email: body.email.trim(),
      phone: body.phone.trim(),
      address: body.address?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Mock 데이터에 추가 (실제 구현에서는 Supabase에 저장)
    mockCustomers.unshift(newCustomer)
    
    console.log('Customer created successfully:', newCustomer)

    return NextResponse.json(newCustomer, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}