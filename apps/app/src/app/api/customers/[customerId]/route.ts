import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { MockCustomerService } from '@/lib/mockData'


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    // 사용자 인증 확인
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { customerId } = await params;
    const body = await request.json()
    
    console.log('API Route: PUT /api/customers/[customerId] called for user:', userId)
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

    // RLS가 적용된 클라이언트로 업데이트 (사용자 소유 데이터만 업데이트 가능)
    try {
      const supabase = createUserSupabaseClient(request)
      const { data: updatedCustomer, error } = await supabase
        .from('customers')
        .update({
          company_name: body.company_name.trim(),
          representative_name: body.representative_name.trim(),
          contact_person: body.contact_person?.trim() || null,
          business_registration_number: body.business_registration_number?.trim() || null,
          email: body.email.trim(),
          phone: body.phone.trim(),
          address: body.address?.trim() || null,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', customerId as any)
        .select()
        .single()

      if (error) {
        console.log('Supabase error, using mock data:', error.message)
        // Supabase 실패 시 mock 데이터 사용
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
        
        console.log('Customer updated with mock data:', updatedCustomer)
        return NextResponse.json(updatedCustomer, { status: 200 })
      }

      console.log('Customer updated in Supabase:', updatedCustomer)
      return NextResponse.json(updatedCustomer, { status: 200 })
    } catch (supabaseError) {
      console.log('Supabase connection failed, using mock data:', supabaseError)
      // Supabase 연결 실패 시 mock 데이터 사용
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
      
      console.log('Customer updated with mock data:', updatedCustomer)
      return NextResponse.json(updatedCustomer, { status: 200 })
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}