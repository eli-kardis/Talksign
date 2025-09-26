import { NextRequest, NextResponse } from 'next/server'

// Mock tax invoices data (세금계산서는 실제 Supabase 테이블이 없으므로 Mock 데이터 사용)
const mockTaxInvoices = [
  {
    id: 1,
    invoiceNumber: 'TAX-2024-001',
    client: '스타트업 A',
    project: '웹사이트 리뉴얼 프로젝트',
    amount: 3000000,
    vatAmount: 300000,
    totalAmount: 3300000,
    status: 'confirmed',
    issueDate: '2024-01-20',
    confirmedDate: '2024-01-21',
    businessNumber: '123-45-67890',
    phone: '010-1234-5678',
    paymentId: 1
  },
  {
    id: 2,
    invoiceNumber: 'TAX-2024-002',
    client: '기업 B',
    project: '모바일 앱 개발',
    amount: 8000000,
    vatAmount: 800000,
    totalAmount: 8800000,
    status: 'sent',
    issueDate: '2024-01-22',
    dueDate: '2024-02-22',
    businessNumber: '234-56-78901',
    phone: '010-2345-6789',
    paymentId: 2
  }
];

export async function GET() {
  try {
    console.log('API Route: GET /api/tax-invoices called')
    
    return NextResponse.json(mockTaxInvoices, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}