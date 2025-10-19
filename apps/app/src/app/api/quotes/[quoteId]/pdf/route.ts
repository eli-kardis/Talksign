import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logSensitiveOperation, extractMetadata } from '@/lib/audit-log'
import { parseQuoteFromDb } from '@/lib/types'
import { generateQuotePDF } from '@/lib/pdf-generator'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await params
  try {
    const userId = await getUserFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting 체크 (PDF 생성은 더 많은 요청 허용)
    const rateLimitError = checkRateLimit(userId, RATE_LIMITS.FILE_OPERATIONS)
    if (rateLimitError) {
      return rateLimitError
    }

    const supabase = createUserSupabaseClient(request)

    // 견적서 조회
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .eq('user_id', userId)
      .single()

    if (error || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    // DB 타입을 애플리케이션 타입으로 변환
    const validQuote = parseQuoteFromDb(quote)

    // 사용자 정보 조회 (공급자 정보로 사용)
    const { data: user } = await supabase
      .from('users')
      .select('name, phone, business_registration_number, company_name, business_name')
      .eq('id', userId)
      .single()

    const supplierInfo = user || {} as any

    // PDF 생성
    const pdfBuffer = await generateQuotePDF(validQuote, supplierInfo)

    // 파일명 생성: 공급자명_제목_견적서_날짜.pdf
    const supplierName = (supplierInfo.company_name || supplierInfo.name || '공급자')
      .replace(/[/\\?%*:|"<>]/g, '_') // 파일명에 사용 불가능한 문자 제거
      .replace(/\s+/g, '_') // 공백을 언더스코어로 변경
      .substring(0, 30) // 최대 30자로 제한

    const title = validQuote.title
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 40) // 최대 40자로 제한

    const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식
    const fileName = `${supplierName}_${title}_견적서_${date}.pdf`

    // Audit logging for sensitive operation (PDF export)
    await logSensitiveOperation(
      userId,
      'export',
      'quote',
      quoteId,
      {
        ...extractMetadata(request),
        export_type: 'pdf',
        file_name: fileName
      }
    )

    // PDF 응답 반환
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Error generating quote PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}