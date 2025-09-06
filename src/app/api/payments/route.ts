import { NextRequest, NextResponse } from 'next/server'

// Mock payments data (결제는 실제 Supabase 테이블이 없으므로 Mock 데이터 사용)
const mockPayments = [
  {
    id: 1,
    client: "스타트업 A",
    project: "웹사이트 리뉴얼 프로젝트",
    amount: 3000000,
    status: "paid",
    createdDate: "2024-01-15",
    dueDate: "2024-01-25",
    paidDate: "2024-01-20",
    paymentMethod: "카드결제",
    invoiceUrl: "#",
    phone: "010-1234-5678"
  },
  {
    id: 2,
    client: "기업 B",
    project: "모바일 앱 개발",
    amount: 8000000,
    status: "sent",
    createdDate: "2024-01-14",
    dueDate: "2024-01-24",
    phone: "010-2345-6789"
  },
  {
    id: 3,
    client: "개인 C",
    project: "브랜딩 디자인 패키지",
    amount: 1500000,
    status: "overdue",
    createdDate: "2024-01-10",
    dueDate: "2024-01-20",
    phone: "010-3456-7890"
  },
  {
    id: 4,
    client: "소상공인 D",
    project: "온라인 쇼핑몰 구축",
    amount: 2500000,
    status: "pending",
    createdDate: "2024-01-12",
    dueDate: "2024-01-22",
    phone: "010-4567-8901"
  },
  {
    id: 5,
    client: "스타트업 E",
    project: "마케팅 컨설팅 (정기)",
    amount: 500000,
    status: "paid",
    createdDate: "2024-01-01",
    dueDate: "2024-01-31",
    paidDate: "2024-01-05",
    paymentMethod: "계좌이체",
    invoiceUrl: "#",
    phone: "010-5678-9012",
    isRecurring: true,
    nextPaymentDate: "2024-02-28"
  }
];

export async function GET() {
  try {
    console.log('API Route: GET /api/payments called')
    
    return NextResponse.json(mockPayments, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}