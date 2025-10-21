import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/auth-utils'
import { validateAccessToken, markTokenAsUsed } from '@/lib/access-token'
import { sendContractApprovedKakao } from '@/lib/lunasoft-client'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { signature_data } = body

    if (!signature_data) {
      return NextResponse.json(
        { error: '서명 데이터가 필요합니다.' },
        { status: 400 }
      )
    }

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

    if (contract.status === 'signed') {
      return NextResponse.json(
        { error: '이미 서명된 계약서입니다.' },
        { status: 400 }
      )
    }

    if (contract.status === 'cancelled') {
      return NextResponse.json(
        { error: '거절된 계약서는 승인할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 서명 저장
    const { error: signatureError } = await supabase
      .from('contract_signatures')
      .insert({
        contract_id: contract.id,
        signer_name: contract.client_name,
        signer_email: contract.client_email,
        signer_type: 'client',
        signature_data,
        signed_at: new Date().toISOString(),
      })

    if (signatureError) {
      throw new Error('서명 저장에 실패했습니다.')
    }

    // 계약서 상태를 'signed'로 변경
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        status: 'signed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', contract.id)

    if (updateError) {
      throw new Error('계약서 상태 업데이트에 실패했습니다.')
    }

    await markTokenAsUsed(token)

    // 발송자에게 승인 알림톡
    const { data: supplier } = await supabase
      .from('users')
      .select('name, phone')
      .eq('id', contract.user_id)
      .single()

    if (supplier?.phone) {
      try {
        await sendContractApprovedKakao({
          phoneNumber: supplier.phone,
          supplierName: supplier.name || '담당자',
          clientName: contract.client_name,
          contractTitle: contract.title,
        })
      } catch (error) {
        console.error('Failed to send approval notification:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: '계약서가 승인되었습니다.',
    })
  } catch (error) {
    console.error('Error approving contract:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '승인 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}
