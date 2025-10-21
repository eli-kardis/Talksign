import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth-utils'
import { validateAccessToken } from '@/lib/access-token'

/**
 * GET /api/public/contracts/[token]
 * 토큰으로 공개 계약서 조회
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // 토큰 검증
    const tokenInfo = await validateAccessToken(token)
    if (!tokenInfo || tokenInfo.entity_type !== 'contract') {
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 링크입니다.' },
        { status: 404 }
      )
    }

    const supabase = createServerSupabaseClient()

    // 계약서 조회
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', tokenInfo.entity_id)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: '계약서를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // supplier_info JSON 파싱
    let supplierInfo: any = {}
    if (contract.supplier_info) {
      try {
        supplierInfo = typeof contract.supplier_info === 'string'
          ? JSON.parse(contract.supplier_info)
          : contract.supplier_info
      } catch (e) {
        console.error('Failed to parse supplier_info:', e)
      }
    }

    // 응답 데이터 구성
    const responseData = {
      id: contract.id,
      title: contract.title,
      client_name: contract.client_name,
      client_email: contract.client_email,
      client_phone: contract.client_phone,
      client_company: contract.client_company,
      supplier_name: supplierInfo.name || '',
      supplier_email: supplierInfo.email || '',
      supplier_phone: supplierInfo.phone || '',
      supplier_company: supplierInfo.company || supplierInfo.businessName || '',
      project_start_date: contract.project_start_date,
      project_end_date: contract.project_end_date,
      project_description: contract.project_description,
      items: contract.items || [],
      total_amount: contract.total_amount,
      status: contract.status,
      created_at: contract.created_at,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching public contract:', error)
    return NextResponse.json(
      { error: '계약서를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
