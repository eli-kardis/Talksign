import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { parseContractFromDb } from '@/lib/types'
import { generateContractPDF } from '@/lib/pdf-generator'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const { contractId } = await params
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createUserSupabaseClient(request)

    // 계약서 조회
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .eq('user_id', userId)
      .single()

    if (error || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // DB 타입을 애플리케이션 타입으로 변환
    const validContract = parseContractFromDb(contract)

    // 사용자 정보 조회 (공급자 정보로 사용)
    const { data: user } = await supabase
      .from('users')
      .select('name, phone, business_registration_number, company_name, business_name')
      .eq('id', userId)
      .single()

    const supplierInfo = user || {} as any

    // PDF 생성
    const pdfBuffer = await generateContractPDF(validContract, supplierInfo)

    // 파일명 생성: 공급자명_제목_계약서_날짜.pdf
    const supplierName = (supplierInfo.company_name || supplierInfo.name || '공급자')
      .replace(/[/\\?%*:|"<>]/g, '_') // 파일명에 사용 불가능한 문자 제거
      .replace(/\s+/g, '_') // 공백을 언더스코어로 변경

    const title = validContract.title
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, '_')

    const date = new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, '')
    const fileName = `${supplierName}_${title}_계약서_${date}.pdf`

    // PDF 응답 반환
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    })
  } catch (error) {
    console.error('Error generating contract PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}