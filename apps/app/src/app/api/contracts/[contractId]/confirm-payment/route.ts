import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth-utils'
import { sendPaymentConfirmedKakao } from '@/lib/lunasoft-client'

/**
 * POST /api/contracts/[contractId]/confirm-payment
 * 계약서 결제 확인 카카오톡 발송
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params
    const body = await request.json()
    const { amount } = body

    // amount: 결제 금액 (선택, 없으면 총 계약금액)

    const supabase = createServerSupabaseClient()

    // 계약서 조회
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: '계약서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 고객 전화번호 확인
    if (!contract.client_phone) {
      return NextResponse.json(
        { error: '고객 전화번호가 등록되지 않았습니다.' },
        { status: 400 }
      )
    }

    // 결제 금액 결정
    const paymentAmount = amount || contract.total_amount || 0

    // 공급자 정보 조회
    const { data: supplier } = await supabase
      .from('users')
      .select('name, business_name')
      .eq('id', contract.user_id)
      .single()

    const supplierName = supplier?.business_name || supplier?.name || '공급자'

    // 결제 조건 조합
    const paymentCondition = contract.payment_terms || ''
    const paymentMethod = contract.payment_method || ''
    const termsOfPayment = paymentCondition && paymentMethod
      ? `${paymentCondition}-${paymentMethod}`
      : paymentCondition || paymentMethod || '미정'

    // 알림톡 발송
    await sendPaymentConfirmedKakao({
      phoneNumber: contract.client_phone,
      clientName: contract.client_name,
      clientCompany: contract.client_company || undefined,
      supplierName,
      contractTitle: contract.title,
      amount: paymentAmount,
      projectStartDate: contract.project_start_date || undefined,
      termsOfPayment,
    })

    return NextResponse.json({
      success: true,
      message: '결제 확인 알림이 카카오톡으로 발송되었습니다.',
    })
  } catch (error) {
    console.error('Error sending payment confirmation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '결제 확인 알림 발송에 실패했습니다.' },
      { status: 500 }
    )
  }
}
