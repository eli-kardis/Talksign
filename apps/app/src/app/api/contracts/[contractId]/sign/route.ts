import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logSensitiveOperation, extractMetadata } from '@/lib/audit-log'

/**
 * POST /api/contracts/[contractId]/sign
 * Add supplier's digital signature to the contract before sending to client
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params;

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 })
    }

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
    const { signatureData } = body

    if (!signatureData) {
      return NextResponse.json(
        { error: 'Signature data is required' },
        { status: 400 }
      )
    }

    console.log('API Route: POST /api/contracts/[contractId]/sign called')
    console.log('Contract ID:', contractId)
    console.log('User ID:', userId)

    // RLS가 적용된 클라이언트 사용 (사용자 본인 데이터만 수정 가능)
    const supabase = createUserSupabaseClient(request)

    // 계약서 소유권 확인
    const { data: existingContract, error: fetchError } = await supabase
      .from('contracts')
      .select('id, user_id, status')
      .eq('id', contractId)
      .single()

    if (fetchError || !existingContract) {
      console.error('Error fetching contract:', fetchError)
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    // draft 상태가 아니면 서명 불가
    if (existingContract.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft contracts can be signed' },
        { status: 400 }
      )
    }

    // Get user info for signature
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single()

    // 서명을 contract_signatures 테이블에 저장
    const { error: signatureError } = await supabase
      .from('contract_signatures')
      .insert({
        contract_id: contractId,
        signer_type: 'supplier',
        signer_name: userData?.name || 'Unknown',
        signer_email: userData?.email || null,
        signature_data: signatureData,
        signed_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || null
      })

    if (signatureError) {
      console.error('Error inserting signature:', signatureError)
      return NextResponse.json(
        { error: 'Failed to save signature' },
        { status: 500 }
      )
    }

    // 계약서 상태를 'pending'으로 업데이트
    const { data: updatedContract, error: updateError } = await supabase
      .from('contracts')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating contract status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update contract status' },
        { status: 500 }
      )
    }

    console.log('Contract signed successfully:', contractId)

    // Audit logging for sensitive operation (digital signature)
    await logSensitiveOperation(
      userId,
      'sign',
      'contract',
      contractId,
      {
        ...extractMetadata(request),
        signature_type: 'supplier',
        action: 'add_supplier_signature'
      }
    )

    return NextResponse.json(
      {
        success: true,
        contract: updatedContract,
        message: 'Signature added successfully'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error in contract signing:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
