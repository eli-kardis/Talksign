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
  let userId: string | null = null

  try {
    userId = await getUserFromRequest(request)
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

    // PDF 응답 반환 with caching headers
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': pdfBuffer.length.toString(),
        // 캐싱 헤더 추가 (5분간 브라우저 캐시)
        'Cache-Control': 'private, max-age=300',
        // ETag 추가 (quote ID + updated_at 기반)
        'ETag': `"${quoteId}-${quote.updated_at || quote.created_at}"`,
      },
    })
  } catch (error) {
    console.error('[Quote PDF Error]', {
      quoteId,
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