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


export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/customers called')
    
    // Mock 데이터 반환 (실제 구현에서는 Supabase에서 데이터를 가져옴)
    const customers = MockCustomerService.getAll()
    
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
    const newCustomer = MockCustomerService.create({
      company_name: body.company_name.trim(),
      representative_name: body.representative_name.trim(),
      contact_person: body.contact_person?.trim() || null,
      business_registration_number: body.business_registration_number?.trim() || null,
      email: body.email.trim(),
      phone: body.phone.trim(),
      address: body.address?.trim() || null
    })
    
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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerIds } = body
    
    console.log('API Route: DELETE /api/customers called')
    console.log('Customer IDs to delete:', customerIds)

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'Customer IDs array is required' },
        { status: 400 }
      )
    }

    // Mock deletion - remove customers from mock array
    const deletedCount = MockCustomerService.delete(customerIds)
    
    console.log('Customers deleted successfully:', deletedCount)

    return NextResponse.json({ 
      message: `${deletedCount} customers deleted successfully`,
      deletedCount: deletedCount 
    }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}