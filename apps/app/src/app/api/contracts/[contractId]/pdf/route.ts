import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import jsPDF from 'jspdf'

export const runtime = 'nodejs'

interface ContractItem {
  name: string
  description?: string
  quantity: number
  unit_price: number
  amount: number
}

interface SupplierInfo {
  name?: string
  phone?: string
  business_registration_number?: string
  company_name?: string
  business_name?: string
}

interface SignatureData {
  data: string
  signedAt: string
  signedBy: string
  ipAddress: string
  userAgent: string
}

interface Contract {
  id: string
  title: string
  content?: string
  client_name: string
  client_email: string
  client_phone?: string
  client_company?: string
  client_address?: string
  client_business_number?: string
  project_description?: string
  project_start_date?: string
  project_end_date?: string
  items: ContractItem[]
  subtotal: number
  tax_amount: number
  tax_rate: number
  total_amount: number
  contract_terms?: string[]
  payment_terms?: string
  payment_method?: string
  additional_payment_terms?: string
  status: string
  created_at: string
  signed_at?: string
  freelancer_signature_data?: SignatureData
  client_signature_data?: SignatureData
}

function generateContractPDF(contract: Contract, supplierInfo: SupplierInfo): Buffer {
  const pdf = new jsPDF('p', 'mm', 'a4')

  pdf.setFont('helvetica')

  let yPosition = 20

  // 제목
  pdf.setFontSize(20)
  pdf.text('업무 계약서', 105, yPosition, { align: 'center' })
  yPosition += 20

  // 계약서 정보
  pdf.setFontSize(10)
  pdf.text(`계약서 번호: ${contract.id}`, 20, yPosition)
  pdf.text(`작성일: ${new Date(contract.created_at).toLocaleDateString('ko-KR')}`, 140, yPosition)
  yPosition += 10

  if (contract.signed_at) {
    pdf.text(`체결일: ${new Date(contract.signed_at).toLocaleDateString('ko-KR')}`, 140, yPosition)
    yPosition += 15
  } else {
    yPosition += 10
  }

  // 계약 당사자 정보
  pdf.setFontSize(14)
  pdf.text('계약 당사자', 20, yPosition)
  yPosition += 10

  // 공급자 (갑)
  pdf.setFontSize(12)
  pdf.text('갑 (공급자)', 20, yPosition)
  yPosition += 8

  pdf.setFontSize(10)
  if (supplierInfo?.name || supplierInfo?.company_name) {
    pdf.text(`상호: ${supplierInfo.name || supplierInfo.company_name}`, 25, yPosition)
    yPosition += 6
  }
  if (supplierInfo?.business_registration_number) {
    pdf.text(`사업자등록번호: ${supplierInfo.business_registration_number}`, 25, yPosition)
    yPosition += 6
  }
  if (supplierInfo?.phone) {
    pdf.text(`연락처: ${supplierInfo.phone}`, 25, yPosition)
    yPosition += 6
  }
  yPosition += 5

  // 고객 (을)
  pdf.setFontSize(12)
  pdf.text('을 (고객)', 20, yPosition)
  yPosition += 8

  pdf.setFontSize(10)
  if (contract.client_company) {
    pdf.text(`상호: ${contract.client_company}`, 25, yPosition)
    yPosition += 6
  }
  pdf.text(`대표자: ${contract.client_name}`, 25, yPosition)
  yPosition += 6
  pdf.text(`이메일: ${contract.client_email}`, 25, yPosition)
  yPosition += 6

  if (contract.client_phone) {
    pdf.text(`연락처: ${contract.client_phone}`, 25, yPosition)
    yPosition += 6
  }
  if (contract.client_business_number) {
    pdf.text(`사업자등록번호: ${contract.client_business_number}`, 25, yPosition)
    yPosition += 6
  }
  if (contract.client_address) {
    pdf.text(`주소: ${contract.client_address}`, 25, yPosition)
    yPosition += 6
  }
  yPosition += 15

  // 프로젝트 개요
  pdf.setFontSize(14)
  pdf.text('프로젝트 개요', 20, yPosition)
  yPosition += 10

  pdf.setFontSize(10)
  pdf.text(`프로젝트명: ${contract.title}`, 20, yPosition)
  yPosition += 8

  if (contract.project_description) {
    pdf.text('프로젝트 설명:', 20, yPosition)
    yPosition += 6
    const descLines = pdf.splitTextToSize(contract.project_description, 170)
    pdf.text(descLines, 20, yPosition)
    yPosition += descLines.length * 6 + 5
  }

  if (contract.project_start_date || contract.project_end_date) {
    if (contract.project_start_date) {
      pdf.text(`시작일: ${new Date(contract.project_start_date).toLocaleDateString('ko-KR')}`, 20, yPosition)
    }
    if (contract.project_end_date) {
      pdf.text(`종료일: ${new Date(contract.project_end_date).toLocaleDateString('ko-KR')}`, 100, yPosition)
    }
    yPosition += 15
  }

  // 계약 금액
  pdf.setFontSize(14)
  pdf.text('계약 금액', 20, yPosition)
  yPosition += 10

  if (contract.items && contract.items.length > 0) {
    // 세부 항목 테이블
    pdf.setFontSize(9)
    pdf.text('항목명', 20, yPosition)
    pdf.text('수량', 80, yPosition)
    pdf.text('단가', 110, yPosition)
    pdf.text('금액', 150, yPosition)
    yPosition += 8

    pdf.line(20, yPosition - 2, 190, yPosition - 2)

    contract.items.forEach((item) => {
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

    pdf.line(20, yPosition, 190, yPosition)
    yPosition += 8
  }

  pdf.setFontSize(10)
  pdf.text(`소계: ${contract.subtotal.toLocaleString('ko-KR')}원`, 20, yPosition)
  yPosition += 6
  pdf.text(`부가세(${contract.tax_rate}%): ${contract.tax_amount.toLocaleString('ko-KR')}원`, 20, yPosition)
  yPosition += 6
  pdf.setFontSize(12)
  pdf.text(`총 계약금액: ${contract.total_amount.toLocaleString('ko-KR')}원`, 20, yPosition)
  yPosition += 15

  // 결제 조건
  if (contract.payment_terms || contract.payment_method) {
    pdf.setFontSize(14)
    pdf.text('결제 조건', 20, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    if (contract.payment_method) {
      pdf.text(`결제 방법: ${contract.payment_method}`, 20, yPosition)
      yPosition += 6
    }
    if (contract.payment_terms) {
      pdf.text(`결제 조건: ${contract.payment_terms}`, 20, yPosition)
      yPosition += 6
    }
    if (contract.additional_payment_terms) {
      pdf.text('추가 결제 조건:', 20, yPosition)
      yPosition += 6
      const additionalLines = pdf.splitTextToSize(contract.additional_payment_terms, 170)
      pdf.text(additionalLines, 20, yPosition)
      yPosition += additionalLines.length * 6
    }
    yPosition += 10
  }

  // 계약 조건
  if (contract.contract_terms && contract.contract_terms.length > 0) {
    if (yPosition > 220) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.setFontSize(14)
    pdf.text('계약 조건', 20, yPosition)
    yPosition += 10

    pdf.setFontSize(10)
    contract.contract_terms.forEach((term, index) => {
      if (yPosition > 250) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.text(`${index + 1}. ${term}`, 20, yPosition)
      yPosition += 8
    })
    yPosition += 10
  }

  // 서명란
  if (yPosition > 220) {
    pdf.addPage()
    yPosition = 20
  }

  pdf.setFontSize(12)
  pdf.text('본 계약의 성실한 이행을 위하여 계약서 2통을 작성하고', 20, yPosition)
  yPosition += 8
  pdf.text('갑, 을이 각각 서명한 후 1통씩 보관한다.', 20, yPosition)
  yPosition += 20

  pdf.text(`${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일`, 20, yPosition)
  yPosition += 20

  // 서명 공간
  pdf.text('갑 (공급자)', 30, yPosition)
  pdf.text('을 (고객)', 130, yPosition)
  yPosition += 10

  // 공급자 서명 이미지 또는 텍스트
  if (contract.freelancer_signature_data?.data) {
    try {
      // 서명 이미지를 PDF에 추가
      const signatureImage = contract.freelancer_signature_data.data
      pdf.addImage(signatureImage, 'PNG', 30, yPosition, 40, 15)
      yPosition += 18
      pdf.setFontSize(8)
      pdf.text(`서명일: ${new Date(contract.freelancer_signature_data.signedAt).toLocaleDateString('ko-KR')}`, 30, yPosition)
      pdf.setFontSize(10)
    } catch (error) {
      console.error('Error adding supplier signature image:', error)
      pdf.text(`서명: ${supplierInfo?.name || '_______________'}`, 30, yPosition)
    }
  } else {
    pdf.text(`서명: ${supplierInfo?.name || '_______________'}`, 30, yPosition)
  }

  // 고객 서명 이미지 또는 텍스트
  const clientYPosition = yPosition - (contract.freelancer_signature_data?.data ? 18 : 0)
  if (contract.client_signature_data?.data) {
    try {
      // 고객 서명 이미지를 PDF에 추가
      const clientSignatureImage = contract.client_signature_data.data
      pdf.addImage(clientSignatureImage, 'PNG', 130, clientYPosition, 40, 15)
      const clientSignDateY = clientYPosition + 18
      pdf.setFontSize(8)
      pdf.text(`서명일: ${new Date(contract.client_signature_data.signedAt).toLocaleDateString('ko-KR')}`, 130, clientSignDateY)
      pdf.setFontSize(10)
    } catch (error) {
      console.error('Error adding client signature image:', error)
      pdf.text(`서명: ${contract.client_name}`, 130, clientYPosition)
    }
  } else {
    pdf.text(`서명: _______________`, 130, clientYPosition)
  }

  return Buffer.from(pdf.output('arraybuffer'))
}

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

    // 사용자 정보 조회 (공급자 정보로 사용)
    const { data: user } = await supabase
      .from('users')
      .select('name, phone, business_registration_number, company_name, business_name')
      .eq('id', userId)
      .single()

    const supplierInfo = user || {}

    // PDF 생성
    const pdfBuffer = generateContractPDF(contract, supplierInfo)

    // PDF 응답 반환
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contract-${contract.id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating contract PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}