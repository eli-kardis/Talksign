import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

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

    console.log('API Route: GET /api/tax-invoices called for user:', userId)

    // RLS가 적용된 클라이언트 사용 (사용자 본인 데이터만 접근 가능)
    const supabase = createUserSupabaseClient(request)

    // 세금계산서 목록 조회 (RLS 정책으로 user_id가 자동으로 필터링됨)
    const { data: taxInvoices, error } = await supabase
      .from('tax_invoices')
      .select(`
        *,
        payment:payment_id (
          id,
          amount,
          contract:contract_id (
            id,
            title,
            client_name,
            client_phone,
            client_business_number
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tax invoices:', error)
      return NextResponse.json({ error: 'Failed to fetch tax invoices' }, { status: 500 })
    }

    // 데이터 변환 (프론트엔드 형식에 맞춤)
    const transformedInvoices = (taxInvoices || []).map((invoice: any) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number || `TAX-${invoice.id}`,
      client: invoice.payment?.contract?.client_name || 'Unknown Client',
      project: invoice.payment?.contract?.title || 'Unknown Project',
      amount: invoice.supply_amount || 0,
      vatAmount: invoice.tax_amount || 0,
      totalAmount: invoice.total_amount || 0,
      status: invoice.status,
      issueDate: invoice.issue_date ? new Date(invoice.issue_date).toISOString().split('T')[0] : '',
      confirmedDate: invoice.confirmed_date ? new Date(invoice.confirmed_date).toISOString().split('T')[0] : null,
      dueDate: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : null,
      businessNumber: invoice.payment?.contract?.client_business_number || '',
      phone: invoice.payment?.contract?.client_phone || '',
      paymentId: invoice.payment_id
    }))

    console.log(`Successfully fetched ${transformedInvoices.length} tax invoices`)
    return NextResponse.json(transformedInvoices)
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
    console.log('API Route: POST /api/tax-invoices called for user:', userId)
    console.log('Request body:', body)

    // 필수 필드 검증
    if (!body.payment_id || !body.total_amount) {
      return NextResponse.json(
        { error: 'Missing required fields: payment_id, total_amount' },
        { status: 400 }
      )
    }

    // RLS가 적용된 클라이언트 사용
    const supabase = createUserSupabaseClient(request)

    // 세금계산서 데이터 준비 (user_id는 인증된 userId 사용)
    const taxInvoiceData = {
      user_id: userId,  // ✅ 인증된 사용자 ID 사용
      payment_id: body.payment_id,
      invoice_number: body.invoice_number || `TAX-${Date.now()}`,
      supply_amount: body.supply_amount || body.amount || 0,
      tax_amount: body.tax_amount || body.vatAmount || 0,
      total_amount: body.total_amount,
      issue_date: body.issue_date || new Date().toISOString().split('T')[0],
      supply_date: body.supply_date || new Date().toISOString().split('T')[0],
      status: body.status || 'draft',
      buyer_name: body.buyer_name || 'Unknown',
      supplier_name: body.supplier_name || 'Unknown',
      supplier_address: body.supplier_address || 'Unknown',
      supplier_business_number: body.supplier_business_number || 'Unknown',
    }

    console.log('Creating tax invoice:', taxInvoiceData)

    // 세금계산서 생성 (RLS 정책으로 본인 세금계산서만 생성 가능)
    const { data: taxInvoice, error } = await supabase
      .from('tax_invoices')
      .insert(taxInvoiceData)
      .select()
      .single()

    if (error) {
      console.error('Error creating tax invoice:', error)
      return NextResponse.json({
        error: 'Failed to create tax invoice',
        details: error.message
      }, { status: 500 })
    }

    console.log('Tax invoice created successfully:', taxInvoice)
    return NextResponse.json(taxInvoice, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}