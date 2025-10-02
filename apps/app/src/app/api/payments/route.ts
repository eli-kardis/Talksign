import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logCreate, extractMetadata } from '@/lib/audit-log'

export async function GET(request: NextRequest) {
  try {
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

    console.log('API Route: GET /api/payments called for user:', userId)

    // RLS가 적용된 클라이언트 사용 (사용자 본인 데이터만 접근 가능)
    const supabase = createUserSupabaseClient(request)

    // 결제 목록 조회 (RLS 정책으로 user_id가 자동으로 필터링됨)
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        contract:contract_id (
          id,
          title,
          client_name,
          client_phone
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    // 데이터 변환 (프론트엔드 형식에 맞춤)
    const transformedPayments = (payments || []).map((payment: any) => ({
      id: payment.id,
      client: payment.contract?.client_name || 'Unknown Client',
      project: payment.contract?.title || 'Unknown Project',
      amount: payment.amount,
      status: payment.status,
      createdDate: payment.created_at ? new Date(payment.created_at).toISOString().split('T')[0] : '',
      dueDate: payment.due_date || null,
      paidDate: payment.paid_at ? new Date(payment.paid_at).toISOString().split('T')[0] : null,
      paymentMethod: payment.payment_method || null,
      invoiceUrl: payment.receipt_url || '#',
      phone: payment.contract?.client_phone || '',
      contractId: payment.contract_id,
      transactionId: payment.transaction_id
    }))

    console.log(`Successfully fetched ${transformedPayments.length} payments`)
    return NextResponse.json(transformedPayments)
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

    // Rate limiting 체크
    const rateLimitError = checkRateLimit(userId, RATE_LIMITS.DEFAULT)
    if (rateLimitError) {
      return rateLimitError
    }

    const body = await request.json()
    console.log('API Route: POST /api/payments called for user:', userId)
    console.log('Request body:', body)

    // 필수 필드 검증
    if (!body.contract_id || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: contract_id, amount' },
        { status: 400 }
      )
    }

    // RLS가 적용된 클라이언트 사용
    const supabase = createUserSupabaseClient(request)

    // 결제 데이터 준비 (user_id는 인증된 userId 사용)
    const paymentData = {
      user_id: userId,  // ✅ 인증된 사용자 ID 사용
      contract_id: body.contract_id,
      amount: body.amount,
      currency: body.currency || 'KRW',
      payment_method: body.payment_method || null,
      status: body.status || 'pending',
      pg_provider: body.pg_provider || null,
      transaction_id: body.transaction_id || null
    }

    console.log('Creating payment:', paymentData)

    // 결제 생성 (RLS 정책으로 본인 결제만 생성 가능)
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single()

    if (error) {
      console.error('Error creating payment:', error)
      return NextResponse.json({
        error: 'Failed to create payment',
        details: error.message
      }, { status: 500 })
    }

    console.log('Payment created successfully:', payment)

    // Audit logging
    await logCreate(userId, 'payment', payment.id, paymentData, extractMetadata(request))

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}