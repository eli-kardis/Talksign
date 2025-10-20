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
  let userId: string | null = null

  try {
    userId = await getUserFromRequest(request)
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
      .substring(0, 30) // 최대 30자로 제한

    const title = validContract.title
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 40) // 최대 40자로 제한

    const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식
    const fileName = `${supplierName}_${title}_계약서_${date}.pdf`

    // PDF 응답 반환 with caching headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': pdfBuffer.length.toString(),
        // 캐싱 헤더 추가 (5분간 브라우저 캐시)
        'Cache-Control': 'private, max-age=300',
        // ETag 추가 (contract ID + updated_at 기반)
        'ETag': `"${contractId}-${contract.updated_at || contract.created_at}"`,
      },
    })
  } catch (error) {
    console.error('[Contract PDF Error]', {
      contractId,
      userId,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : String(error),
      timestamp: new Date().toISOString()
    })

    // 특정 에러 타입에 따른 상세 응답
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json({
          error: 'PDF generation timeout',
          message: 'PDF 생성 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
        }, { status: 504 })
      }
      if (error.message.includes('file size')) {
        return NextResponse.json({
          error: 'PDF file too large',
          message: error.message
        }, { status: 413 })
      }
    }

    return NextResponse.json({
      error: 'Failed to generate PDF',
      message: 'PDF 생성에 실패했습니다. 잠시 후 다시 시도해주세요.'
    }, { status: 500 })
  }
}