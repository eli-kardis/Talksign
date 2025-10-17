import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logSensitiveOperation, extractMetadata } from '@/lib/audit-log'
import { type Quote, type SupplierInfo, parseQuoteFromDb } from '@/lib/types'
import jsPDF from 'jspdf'

export const runtime = 'nodejs'

function generateQuotePDF(quote: Quote, supplierInfo: SupplierInfo): Buffer {
  const pdf = new jsPDF('p', 'mm', 'a4')

  // 한글 폰트 설정을 위한 기본 설정
  pdf.setFont('helvetica')

  let yPosition = 20

  // 제목
  pdf.setFontSize(20)
  pdf.text('견적서', 105, yPosition, { align: 'center' })
  yPosition += 20

  // 견적서 정보
  pdf.setFontSize(10)
  pdf.text(`견적서 번호: ${quote.id}`, 20, yPosition)
  if (quote.created_at) {
    pdf.text(`작성일: ${new Date(quote.created_at).toLocaleDateString('ko-KR')}`, 140, yPosition)
  }
  yPosition += 10

  if (quote.expires_at) {
    pdf.text(`유효기한: ${new Date(quote.expires_at).toLocaleDateString('ko-KR')}`, 140, yPosition)
    yPosition += 15
  } else {
    yPosition += 10
  }

  // 공급자 정보
  pdf.setFontSize(12)
  pdf.text('공급자 정보', 20, yPosition)
  yPosition += 8

  pdf.setFontSize(10)
  if (supplierInfo?.name) {
    pdf.text(`회사명: ${supplierInfo.name}`, 20, yPosition)
    yPosition += 6
  }
  if (supplierInfo?.business_registration_number) {
    pdf.text(`사업자등록번호: ${supplierInfo.business_registration_number}`, 20, yPosition)
    yPosition += 6
  }
  if (supplierInfo?.phone) {
    pdf.text(`연락처: ${supplierInfo.phone}`, 20, yPosition)
    yPosition += 6
  }
  yPosition += 10

  // 고객 정보
  pdf.setFontSize(12)
  pdf.text('고객 정보', 20, yPosition)
  yPosition += 8

  pdf.setFontSize(10)
  pdf.text(`고객명: ${quote.client_name}`, 20, yPosition)
  yPosition += 6
  pdf.text(`이메일: ${quote.client_email}`, 20, yPosition)
  yPosition += 6

  if (quote.client_phone) {
    pdf.text(`연락처: ${quote.client_phone}`, 20, yPosition)
    yPosition += 6
  }
  if (quote.client_company) {
    pdf.text(`회사명: ${quote.client_company}`, 20, yPosition)
    yPosition += 6
  }
  if (quote.client_address) {
    pdf.text(`주소: ${quote.client_address}`, 20, yPosition)
    yPosition += 6
  }
  yPosition += 10

  // 프로젝트 정보
  pdf.setFontSize(12)
  pdf.text('프로젝트 정보', 20, yPosition)
  yPosition += 8

  pdf.setFontSize(10)
  pdf.text(`제목: ${quote.title}`, 20, yPosition)
  yPosition += 6

  if (quote.description) {
    const lines = pdf.splitTextToSize(`설명: ${quote.description}`, 170)
    pdf.text(lines, 20, yPosition)
    yPosition += lines.length * 6
  }
  yPosition += 10

  // 견적 항목 테이블
  pdf.setFontSize(12)
  pdf.text('견적 항목', 20, yPosition)
  yPosition += 10

  // 테이블 헤더
  pdf.setFontSize(9)
  pdf.text('항목명', 20, yPosition)
  pdf.text('수량', 80, yPosition)
  pdf.text('단가', 110, yPosition)
  pdf.text('금액', 150, yPosition)
  yPosition += 8

  // 구분선
  pdf.line(20, yPosition - 2, 190, yPosition - 2)

  // 견적 항목들
  quote.items.forEach((item) => {
    if (yPosition > 250) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.text(item.name, 20, yPosition)
    pdf.text(item.quantity.toString(), 80, yPosition)
    pdf.text(item.unit_price.toLocaleString('ko-KR') + '원', 110, yPosition)
    pdf.text(item.amount.toLocaleString('ko-KR') + '원', 150, yPosition)
    yPosition += 8

    if (item.description) {
      pdf.setFontSize(8)
      const descLines = pdf.splitTextToSize(`  - ${item.description}`, 150)
      pdf.text(descLines, 20, yPosition)
      yPosition += descLines.length * 5
      pdf.setFontSize(9)
    }
  })

  // 구분선
  pdf.line(20, yPosition, 190, yPosition)
  yPosition += 10

  // 총액
  pdf.setFontSize(12)
  pdf.text(`총 금액: ${(quote.subtotal || 0).toLocaleString('ko-KR')}원`, 150, yPosition, { align: 'right' })

  return Buffer.from(pdf.output('arraybuffer'))
}

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

    const supplierInfo = user || {}

    // PDF 생성
    const pdfBuffer = generateQuotePDF(validQuote, supplierInfo)

    // Audit logging for sensitive operation (PDF export)
    await logSensitiveOperation(
      userId,
      'export',
      'quote',
      quoteId,
      {
        ...extractMetadata(request),
        export_type: 'pdf',
        file_name: `quote-${validQuote.id}.pdf`
      }
    )

    // PDF 응답 반환
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${validQuote.id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating quote PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}