import { NextRequest, NextResponse } from 'next/server'
import { createUserSupabaseClient, getUserFromRequest } from '@/lib/auth-utils'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { logDelete, extractMetadata } from '@/lib/audit-log'
import { parseContractFromDb } from '@/lib/types'
import type { Database } from '@/lib/database.types'

// Mock contract data with detailed information
interface MockContract {
  id: string
  title: string
  description?: string
  status: string
  client_name: string
  client_email: string
  client_phone: string
  client_company: string | null
  client_business_number?: string | null
  client_address?: string
  project_start_date: string
  project_end_date: string
  project_description?: string
  items: Array<{
    id: string
    name: string
    description: string
    unit_price: number
    quantity: number
    amount: number
  }>
  terms: string[]
  payment_terms?: string
  subtotal: number
  tax_amount: number
  tax_rate: number
  total_amount: number
  created_at: string
  signed_date?: string | null
  supplier?: {
    name: string
    email: string
    phone: string
    business_name: string
    business_registration_number: string
    company_name: string
    business_address: string
  }
}

const mockContracts: MockContract[] = [
  {
    id: "90cfcedd-b86d-4f13-96c0-bce2d9072665",
    title: "웹사이트 리뉴얼 프로젝트 계약서",
    status: "signed",
    client_name: "김고객",
    client_email: "client@startup-a.com",
    client_phone: "010-1234-5678",
    client_company: "(주)스타트업에이",
    client_business_number: "123-45-67890",
    client_address: "서울시 강남구 테헤란로 123, 4층",
    supplier: {
      name: "김프리",
      email: "freelancer@kimfree.com",
      phone: "010-9876-5432",
      business_name: "김프리 스튜디오",
      company_name: "김프리 스튜디오",
      business_registration_number: "987-65-43210",
      business_address: "서울시 서초구 강남대로 456, 2층"
    },
    items: [
      {
        id: "item1",
        name: "웹사이트 디자인 (PC/모바일)",
        description: "반응형 웹사이트 UI/UX 디자인",
        quantity: 1,
        unit_price: 1500000,
        amount: 1500000
      },
      {
        id: "item2",
        name: "퍼블리싱 및 프론트엔드 개발",
        description: "HTML/CSS/JavaScript 기반 웹사이트 구현",
        quantity: 1,
        unit_price: 1200000,
        amount: 1200000
      },
      {
        id: "item3",
        name: "SEO 최적화",
        description: "검색엔진 최적화 및 성능 개선",
        quantity: 1,
        unit_price: 300000,
        amount: 300000
      }
    ],
    subtotal: 3000000,
    tax_amount: 300000,
    tax_rate: 0.1,
    total_amount: 3300000,
    description: "기존 웹사이트의 UI/UX 개선 및 반응형 웹사이트 구축 프로젝트에 대한 계약입니다.",
    project_start_date: "2024-01-20",
    project_end_date: "2024-03-31",
    terms: [
      "프로젝트 개발 기간: 2024년 1월 20일 ~ 2024년 3월 31일",
      "계약금 50% 선입금, 완료 후 50% 잔금 지급",
      "프로젝트 요구사항 변경 시 추가 비용 발생",
      "저작권은 완전한 대금 지급 후 발주처로 이전",
      "계약 위반 시 위약금 계약금의 10% 부과"
    ],
    created_at: "2024-01-15T09:00:00Z",
    signed_date: "2024-01-18T14:30:00Z"
  },
  {
    id: "7b4e3f2a-c5d6-4e8f-9a1b-2c3d4e5f6789",
    title: "모바일 앱 개발 계약서",
    status: "sent",
    client_name: "이사장",
    client_email: "manager@company-b.com",
    client_phone: "010-2345-6789",
    client_company: "(주)기업비",
    client_business_number: "234-56-78901",
    client_address: "서울시 중구 을지로 100, 10층",
    supplier: {
      name: "김프리",
      email: "freelancer@kimfree.com",
      phone: "010-9876-5432",
      business_name: "김프리 스튜디오",
      company_name: "김프리 스튜디오",
      business_registration_number: "987-65-43210",
      business_address: "서울시 서초구 강남대로 456, 2층"
    },
    items: [
      {
        id: "item1",
        name: "iOS 앱 개발",
        description: "네이티브 iOS 애플리케이션 개발",
        quantity: 1,
        unit_price: 4000000,
        amount: 4000000
      },
      {
        id: "item2",
        name: "Android 앱 개발",
        description: "네이티브 안드로이드 애플리케이션 개발",
        quantity: 1,
        unit_price: 4000000,
        amount: 4000000
      }
    ],
    subtotal: 8000000,
    tax_amount: 800000,
    tax_rate: 0.1,
    total_amount: 8800000,
    description: "iOS 및 Android 모바일 애플리케이션 개발 프로젝트",
    project_start_date: "2024-02-01",
    project_end_date: "2024-06-30",
    terms: [
      "프로젝트 개발 기간: 2024년 2월 1일 ~ 2024년 6월 30일",
      "계약금 30% 선입금, 중간 30%, 완료 후 40% 지급",
      "앱스토어 및 플레이스토어 배포 지원 포함",
      "6개월 무상 유지보수 지원",
      "소스코드는 최종 대금 지급 후 인도"
    ],
    created_at: "2024-01-14T10:00:00Z",
    signed_date: null
  },
  {
    id: "a1b2c3d4-e5f6-4789-abc1-23456789abcd",
    title: "브랜딩 디자인 패키지 계약서",
    status: "completed",
    client_name: "박개인",
    client_email: "personal@email.com",
    client_phone: "010-3456-7890",
    client_company: null,
    client_business_number: null,
    client_address: "서울시 마포구 홍대입구역 5번출구",
    supplier: {
      name: "김프리",
      email: "freelancer@kimfree.com",
      phone: "010-9876-5432",
      business_name: "김프리 스튜디오",
      company_name: "김프리 스튜디오",
      business_registration_number: "987-65-43210",
      business_address: "서울시 서초구 강남대로 456, 2층"
    },
    items: [
      {
        id: "item1",
        name: "로고 디자인",
        description: "브랜드 아이덴티티 로고 디자인",
        quantity: 1,
        unit_price: 800000,
        amount: 800000
      },
      {
        id: "item2",
        name: "브랜드 가이드라인",
        description: "로고 활용 가이드 및 컬러 팔레트",
        quantity: 1,
        unit_price: 700000,
        amount: 700000
      }
    ],
    subtotal: 1500000,
    tax_amount: 150000,
    tax_rate: 0.1,
    total_amount: 1650000,
    description: "개인 브랜드 아이덴티티 디자인 프로젝트",
    project_start_date: "2024-01-10",
    project_end_date: "2024-02-10",
    terms: [
      "프로젝트 개발 기간: 2024년 1월 10일 ~ 2024년 2월 10일",
      "계약금 50% 선입금, 완료 후 50% 잔금 지급",
      "로고 시안 3개 제공, 수정 3회까지 무료",
      "최종 파일은 AI, PNG, JPG 형태로 제공",
      "저작권은 완전한 대금 지급 후 발주처로 이전"
    ],
    created_at: "2024-01-13T11:00:00Z",
    signed_date: "2024-01-14T16:00:00Z"
  },
  {
    id: "f9e8d7c6-b5a4-4321-9876-543210fedcba",
    title: "온라인 쇼핑몰 구축 계약서",
    status: "draft",
    client_name: "최사장",
    client_email: "owner@small-business.co.kr",
    client_phone: "010-4567-8901",
    client_company: "소상공인 D",
    client_business_number: "345-67-89012",
    client_address: "부산시 해운대구 센텀시티로 100, 1층",
    supplier: {
      name: "김프리",
      email: "freelancer@kimfree.com",
      phone: "010-9876-5432",
      business_name: "김프리 스튜디오",
      company_name: "김프리 스튜디오",
      business_registration_number: "987-65-43210",
      business_address: "서울시 서초구 강남대로 456, 2층"
    },
    items: [
      {
        id: "item1",
        name: "쇼핑몰 웹사이트 개발",
        description: "상품 관리, 결제 시스템 포함 온라인 쇼핑몰",
        quantity: 1,
        unit_price: 2000000,
        amount: 2000000
      },
      {
        id: "item2",
        name: "관리자 시스템",
        description: "주문 관리, 재고 관리 어드민 페이지",
        quantity: 1,
        unit_price: 500000,
        amount: 500000
      }
    ],
    subtotal: 2500000,
    tax_amount: 250000,
    tax_rate: 0.1,
    total_amount: 2750000,
    description: "중소규모 온라인 쇼핑몰 구축 프로젝트",
    project_start_date: "2024-02-15",
    project_end_date: "2024-05-15",
    terms: [
      "프로젝트 개발 기간: 2024년 2월 15일 ~ 2024년 5월 15일",
      "계약금 30% 선입금, 중간 40%, 완료 후 30% 지급",
      "결제 시스템 연동 (토스페이, 카카오페이)",
      "3개월 무상 유지보수 지원",
      "호스팅 및 도메인은 별도 비용"
    ],
    created_at: "2024-01-12T13:00:00Z",
    signed_date: null
  }
]

export async function GET(
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

    console.log('API Route: GET /api/contracts/[contractId] called')
    console.log('Contract ID:', contractId)

    // RLS가 적용된 클라이언트 사용 (사용자 본인 데이터만 접근 가능)
    const supabase = createUserSupabaseClient(request)

    // Get contract from Supabase (RLS 정책으로 본인 계약서만 조회 가능)
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single()

    if (error) {
      console.error('Error fetching contract:', error)

      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
      }

      return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 })
    }

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // DB 타입을 애플리케이션 타입으로 변환
    const parsedContract = parseContractFromDb(contract)

    // Transform the contract data to match the expected format
    const transformedContract = {
      id: parsedContract.id,
      title: parsedContract.title,
      status: parsedContract.status,
      client_name: parsedContract.client_name,
      client_email: parsedContract.client_email,
      client_phone: parsedContract.client_phone,
      client_company: parsedContract.client_company,
      client_business_number: parsedContract.client_business_number,
      client_address: parsedContract.client_address,
      supplier: parsedContract.supplier_info || null,
      items: parsedContract.items || [],
      subtotal: parsedContract.subtotal || 0,
      tax_amount: parsedContract.tax_amount || 0,
      tax_rate: parsedContract.tax_rate ? parsedContract.tax_rate / 100 : 0.1, // Convert percentage to decimal
      total_amount: parsedContract.total_amount || 0,
      description: parsedContract.project_description,
      project_start_date: parsedContract.project_start_date,
      project_end_date: parsedContract.project_end_date,
      terms: parsedContract.contract_terms || [],
      created_at: parsedContract.created_at,
      signed_date: parsedContract.signed_at
    }

    console.log('Contract found:', transformedContract)

    return NextResponse.json(transformedContract)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params;
    
    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 })
    }

    const body = await request.json()
    console.log('API Route: PUT /api/contracts/[contractId] called')
    console.log('Contract ID:', contractId)
    console.log('Request body:', body)

    // Find contract in mock data
    const contractIndex = mockContracts.findIndex(c => c.id === contractId)

    if (contractIndex === -1) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Update contract in mock data
    const updatedContract: MockContract = {
      ...mockContracts[contractIndex],
      client_name: body.clientInfo?.name || mockContracts[contractIndex].client_name,
      title: body.contractInfo?.title || mockContracts[contractIndex].title,
      total_amount: body.clientInfo?.amount || mockContracts[contractIndex].total_amount,
      client_phone: body.clientInfo?.phone || mockContracts[contractIndex].client_phone,
      status: body.isDraft ? 'draft' : 'sent',
    }

    mockContracts[contractIndex] = updatedContract

    console.log('Contract updated successfully (mock):', updatedContract)

    return NextResponse.json(updatedContract, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    console.log('API Route: DELETE /api/contracts/[contractId] called')
    console.log('Contract ID:', contractId)

    // RLS가 적용된 클라이언트 사용 (사용자 본인 데이터만 삭제 가능)
    const supabase = createUserSupabaseClient(request)

    // 삭제 전 데이터 조회 (audit log용)
    const { data: contractToDelete } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single()

    // 계약서 삭제 (RLS 정책으로 본인 계약서만 삭제 가능)
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', contractId)

    if (error) {
      console.error('Error deleting contract:', error)

      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
      }

      return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 })
    }

    console.log('Contract deleted successfully:', contractId)

    // Audit logging
    if (contractToDelete) {
      await logDelete(userId, 'contract', contractId, contractToDelete, extractMetadata(request))
    }

    return NextResponse.json({ message: 'Contract deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}