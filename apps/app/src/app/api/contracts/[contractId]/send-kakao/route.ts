import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth-utils'
import { createPublicAccessUrl } from '@/lib/access-token'
import { sendContractSentKakao } from '@/lib/lunasoft-client'

/**
 * POST /api/contracts/[contractId]/send-kakao
 * 계약서 카카오톡 발송
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params
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

    // 프로젝트 시작일 (계약 시작일)
    const projectStartDate = contract.project_start_date || contract.created_at?.split('T')[0] || ''

    // 공개 열람 URL 생성
    const publicUrl = await createPublicAccessUrl('contract', contractId)

    // 알림톡 발송
    await sendContractSentKakao({
      phoneNumber: contract.client_phone,
      clientName: contract.client_name,
      clientCompany: contract.client_company || undefined,
      supplierName,
      contractTitle: contract.title,
      contractCost: contract.total_amount || 0,
      projectStartDate,
      termsOfPayment,
      viewUrl: publicUrl,
    })

    // 계약서 상태를 'pending'으로 변경
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)

    if (updateError) {
      console.error('Failed to update contract status:', updateError)
      // 알림톡은 발송되었으므로 에러를 던지지 않음
    }

    return NextResponse.json({
      success: true,
      message: '계약서가 카카오톡으로 발송되었습니다.',
      publicUrl,
    })
  } catch (error) {
    console.error('Error sending contract via KakaoTalk:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알림톡 발송에 실패했습니다.' },
      { status: 500 }
    )
  }
}
