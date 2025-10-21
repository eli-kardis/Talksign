import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth-utils'
import { createPublicAccessUrl } from '@/lib/access-token'
import { sendQuoteSentKakao } from '@/lib/lunasoft-client'

/**
 * POST /api/quotes/[quoteId]/send-kakao
 * 견적서 카카오톡 발송
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params
    const supabase = createServerSupabaseClient()

    // 견적서 조회
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: '견적서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 고객 전화번호 확인
    if (!quote.client_phone) {
      return NextResponse.json(
        { error: '고객 전화번호가 등록되지 않았습니다.' },
        { status: 400 }
      )
    }

    // 공급자 정보 조회
    const { data: supplier } = await supabase
      .from('users')
      .select('name, business_name')
      .eq('id', quote.user_id)
      .single()

    const supplierName = supplier?.business_name || supplier?.name || '공급자'

    // 발송 시각 (현재 시간)
    const now = new Date()
    const sendTime = now.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    // 공개 열람 URL 생성
    const publicUrl = await createPublicAccessUrl('quote', quoteId)

    // 알림톡 발송
    await sendQuoteSentKakao({
      phoneNumber: quote.client_phone,
      clientName: quote.client_name,
      clientCompany: quote.client_company || undefined,
      supplierName,
      quoteTitle: quote.title,
      quoteCost: quote.total || 0,
      expiryDate: quote.expiry_date || undefined,
      viewUrl: publicUrl,
    })

    // 견적서 상태를 'sent'로 변경
    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        status: 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', quoteId)

    if (updateError) {
      console.error('Failed to update quote status:', updateError)
      // 알림톡은 발송되었으므로 에러를 던지지 않음
    }

    return NextResponse.json({
      success: true,
      message: '견적서가 카카오톡으로 발송되었습니다.',
      publicUrl,
    })
  } catch (error) {
    console.error('Error sending quote via KakaoTalk:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알림톡 발송에 실패했습니다.' },
      { status: 500 }
    )
  }
}
