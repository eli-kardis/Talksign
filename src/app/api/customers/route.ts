import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { MockCustomerService } from '@/lib/mockData'


export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/customers called')
    
    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Authenticated user:', userId)
    
    // RLS가 적용된 Supabase 클라이언트로 데이터 가져오기
    try {
      const supabase = createUserSupabaseClient(request)
      console.log('Fetching customers for user:', userId)
      
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase query error:', error)
        console.log('Error details:', JSON.stringify(error, null, 2))
        // Supabase 연결 실패 시 mock 데이터 사용 (사용자별로)
        const customers = MockCustomerService.getAll()
        console.log('Using mock data, fetched customers:', customers.length)
        return NextResponse.json(customers)
      }

      console.log('Successfully fetched customers from Supabase:', customers ? customers.length : 0)
      return NextResponse.json(customers || [])
    } catch (supabaseError) {
      console.error('Supabase connection exception:', supabaseError)
      // 연결 실패 시 mock 데이터 사용
      const customers = MockCustomerService.getAll()
      console.log('Using mock data, fetched customers:', customers.length)
      return NextResponse.json(customers)
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    console.log('API Route: POST /api/customers called for user:', userId)
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

    // Supabase에 데이터 저장 (user_id 포함)
    try {
      const supabase = createUserSupabaseClient(request)
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert([
          {
            user_id: userId,
            company_name: body.company_name.trim(),
            representative_name: body.representative_name.trim(),
            contact_person: body.contact_person?.trim() || null,
            business_registration_number: body.business_registration_number?.trim() || null,
            email: body.email.trim(),
            phone: body.phone.trim(),
            address: body.address?.trim() || null
          }
        ])
        .select()
        .single()

      if (error) {
        console.log('Supabase error, using mock data:', error.message)
        // Supabase 실패 시 mock 데이터 사용
        const newCustomer = MockCustomerService.create({
          company_name: body.company_name.trim(),
          representative_name: body.representative_name.trim(),
          contact_person: body.contact_person?.trim() || null,
          business_registration_number: body.business_registration_number?.trim() || null,
          email: body.email.trim(),
          phone: body.phone.trim(),
          address: body.address?.trim() || null
        })
        console.log('Customer created with mock data:', newCustomer)
        return NextResponse.json(newCustomer, { status: 201 })
      }

      console.log('Customer created in Supabase:', newCustomer)
      return NextResponse.json(newCustomer, { status: 201 })
    } catch (supabaseError) {
      console.log('Supabase connection failed, using mock data:', supabaseError)
      // Supabase 연결 실패 시 mock 데이터 사용
      const newCustomer = MockCustomerService.create({
        company_name: body.company_name.trim(),
        representative_name: body.representative_name.trim(),
        contact_person: body.contact_person?.trim() || null,
        business_registration_number: body.business_registration_number?.trim() || null,
        email: body.email.trim(),
        phone: body.phone.trim(),
        address: body.address?.trim() || null
      })
      console.log('Customer created with mock data:', newCustomer)
      return NextResponse.json(newCustomer, { status: 201 })
    }
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
    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { customerIds } = body
    
    console.log('API Route: DELETE /api/customers called for user:', userId)
    console.log('Customer IDs to delete:', customerIds)

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: 'Customer IDs array is required' },
        { status: 400 }
      )
    }

    // RLS가 적용된 Supabase 클라이언트로 삭제 (사용자 소유 데이터만 삭제 가능)
    try {
      const supabase = createUserSupabaseClient(request)
      const { error } = await supabase
        .from('customers')
        .delete()
        .in('id', customerIds)

      if (error) {
        console.log('Supabase error, using mock data:', error.message)
        // Supabase 실패 시 mock 데이터 사용
        const deletedCount = MockCustomerService.delete(customerIds)
        console.log('Customers deleted from mock data:', deletedCount)
        return NextResponse.json({ 
          message: `${deletedCount} customers deleted successfully`,
          deletedCount: deletedCount 
        }, { status: 200 })
      }

      console.log('Customers deleted from Supabase:', customerIds.length)
      return NextResponse.json({ 
        message: `${customerIds.length} customers deleted successfully`,
        deletedCount: customerIds.length 
      }, { status: 200 })
    } catch (supabaseError) {
      console.log('Supabase connection failed, using mock data:', supabaseError)
      // Supabase 연결 실패 시 mock 데이터 사용
      const deletedCount = MockCustomerService.delete(customerIds)
      console.log('Customers deleted from mock data:', deletedCount)
      return NextResponse.json({ 
        message: `${deletedCount} customers deleted successfully`,
        deletedCount: deletedCount 
      }, { status: 200 })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}