import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth-utils'
import { validateAccessToken, markTokenAsUsed } from '@/lib/access-token'
import { sendQuoteApprovedKakao } from '@/lib/lunasoft-client'
import { env } from '@/lib/env'

/**
 * POST /api/public/quotes/[token]/approve
 * 견적서 승인
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // 토큰 검증
    const tokenInfo = await validateAccessToken(token)
    if (!tokenInfo || tokenInfo.entity_type !== 'quote') {
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 링크입니다.' },
        { status: 404 }
      )
    }

    const supabase = createServerSupabaseClient()

    // 견적서 조회
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', tokenInfo.entity_id)
      .single()

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: '견적서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 승인/거절된 경우
    if (quote.status === 'accepted') {
      return NextResponse.json(
        { error: '이미 승인된 견적서입니다.' },
        { status: 400 }
      )
    }

    if (quote.status === 'rejected') {
      return NextResponse.json(
        { error: '거절된 견적서는 승인할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 견적서 상태를 'accepted'로 변경
    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', quote.id)

    if (updateError) {
      throw new Error('견적서 상태 업데이트에 실패했습니다.')
    }

    // 토큰 사용 기록
    await markTokenAsUsed(token)

    // 발송자 정보 조회 (유저 테이블에서)
    const { data: supplier } = await supabase
      .from('users')
      .select('name, phone, email')
      .eq('id', quote.user_id)
      .single()

    // 발송자에게 승인 알림톡 발송
    if (supplier?.phone) {
      try {
        const baseUrl = env.NEXT_PUBLIC_BASE_URL || 'https://app.talksign.co.kr'
        const username = supplier.email?.split('@')[0] || 'user'
        const createContractUrl = `${baseUrl}/${username}/documents/contracts/new?quoteId=${quote.id}`

        await sendQuoteApprovedKakao({
          phoneNumber: supplier.phone,
          supplierName: supplier.name || '담당자',
          clientName: quote.client_name,
          quoteTitle: quote.title,
          createContractUrl,
        })
      } catch (error) {
        console.error('Failed to send approval notification:', error)
        // 알림톡 실패해도 승인 처리는 계속 진행
      }
    }

    return NextResponse.json({
      success: true,
      message: '견적서가 승인되었습니다.',
    })
  } catch (error) {
    console.error('Error approving quote:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '승인 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}
