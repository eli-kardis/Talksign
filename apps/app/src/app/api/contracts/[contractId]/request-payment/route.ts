import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth-utils'
import { sendPaymentRequestKakao } from '@/lib/lunasoft-client'

/**
 * POST /api/contracts/[contractId]/request-payment
 * 계약서 결제 요청 카카오톡 발송
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params
    const body = await request.json()
    const { amount, paymentType, dueDate } = body

    // amount: 결제 금액 (선택, 없으면 총 계약금액)
    // paymentType: 'full' | 'deposit' | 'interim' | 'final' (계약금/중도금/잔금)
    // dueDate: 결제 기한 (선택)

    const supabase = createServerSupabaseClient()

    // 계약서 조회 (결제 조건 포함)
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

    // 결제 종류별 메시지
    const paymentTypeLabelMap: Record<string, string> = {
      full: '전액',
      deposit: '계약금',
      interim: '중도금',
      final: '잔금',
    }
    const paymentTypeLabel = paymentTypeLabelMap[paymentType || 'full'] || '전액'

    // 결제 조건 조합 (#{terms_of_payment} 변수)
    const paymentCondition = contract.payment_terms || '' // 선불/후불/분할
    const paymentMethod = contract.payment_method || '' // 계좌이체/카드/현금
    const termsOfPayment = paymentCondition && paymentMethod
      ? `${paymentCondition}-${paymentMethod}`
      : paymentCondition || paymentMethod || '미정'

    // 공급자 정보 조회
    const { data: supplier } = await supabase
      .from('users')
      .select('name, business_name')
      .eq('id', contract.user_id)
      .single()

    const supplierName = supplier?.business_name || supplier?.name || '공급자'

    // 알림톡 발송
    await sendPaymentRequestKakao({
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
      message: '결제 요청이 카카오톡으로 발송되었습니다.',
    })
  } catch (error) {
    console.error('Error sending payment request:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '결제 요청 발송에 실패했습니다.' },
      { status: 500 }
    )
  }
}
