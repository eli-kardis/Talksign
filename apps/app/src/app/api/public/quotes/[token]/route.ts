import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth-utils'
import { validateAccessToken } from '@/lib/access-token'

/**
 * GET /api/public/quotes/[token]
 * 토큰으로 공개 견적서 조회
 */
export async function GET(
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

    // 응답 데이터 구성
    const responseData = {
      id: quote.id,
      title: quote.title,
      client_name: quote.client_name,
      client_email: quote.client_email,
      client_phone: quote.client_phone,
      client_company: quote.client_company,
      items: quote.items || [],
      total: quote.total,
      subtotal: quote.subtotal,
      tax: quote.tax,
      status: quote.status,
      created_at: quote.created_at,
      expiry_date: quote.expiry_date,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching public quote:', error)
    return NextResponse.json(
      { error: '견적서를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
