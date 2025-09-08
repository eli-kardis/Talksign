import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase'
import { MockCustomerService } from '@/lib/mockData'

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


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params;
    const body = await request.json()
    
    console.log('API Route: PUT /api/customers/[customerId] called')
    console.log('Customer ID:', customerId)
    console.log('Request body:', body)

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

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

    // 고객 정보 업데이트
    const updatedCustomer = MockCustomerService.update(customerId, {
      company_name: body.company_name.trim(),
      representative_name: body.representative_name.trim(),
      contact_person: body.contact_person?.trim() || null,
      business_registration_number: body.business_registration_number?.trim() || null,
      email: body.email.trim(),
      phone: body.phone.trim(),
      address: body.address?.trim() || null
    })

    if (!updatedCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
    
    console.log('Customer updated successfully:', updatedCustomer)

    return NextResponse.json(updatedCustomer, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}