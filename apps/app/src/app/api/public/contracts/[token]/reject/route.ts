import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth-utils'
import { validateAccessToken, markTokenAsUsed } from '@/lib/access-token'
import { sendContractRejectedKakao } from '@/lib/lunasoft-client'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const tokenInfo = await validateAccessToken(token)
    if (!tokenInfo || tokenInfo.entity_type !== 'contract') {
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 링크입니다.' },
        { status: 404 }
      )
    }

    const supabase = createServerSupabaseClient()

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

    if (contract.status === 'cancelled') {
      return NextResponse.json(
        { error: '이미 거절된 계약서입니다.' },
        { status: 400 }
      )
    }

    if (contract.status === 'signed') {
      return NextResponse.json(
        { error: '서명된 계약서는 거절할 수 없습니다.' },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', contract.id)

    if (updateError) {
      throw new Error('계약서 상태 업데이트에 실패했습니다.')
    }

    await markTokenAsUsed(token)

    const { data: supplier } = await supabase
      .from('users')
      .select('name, phone')
      .eq('id', contract.user_id)
      .single()

    if (supplier?.phone) {
      try {
        await sendContractRejectedKakao({
          phoneNumber: supplier.phone,
          supplierName: supplier.name || '담당자',
          clientName: contract.client_name,
          contractTitle: contract.title,
        })
      } catch (error) {
        console.error('Failed to send rejection notification:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: '계약서가 거절되었습니다.',
    })
  } catch (error) {
    console.error('Error rejecting contract:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '거절 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}
